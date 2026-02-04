import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { CamPayload } from '../shared/interfaces/cam.interface'
import { IngestionService } from 'src/ingestion/ingestion.service';

@Injectable()
export class SpatialEngineService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private redis: RedisService,
    private readonly ingestionService: IngestionService
  ) {}

  async processCam(cam: CamPayload) {
    const spatialData = await this.dataSource.query(`
      SELECT 
        l.id as "laneId", 
        l."intersectionId", 
        l."isIncoming",
        ST_Distance(i."centerNode", ST_SetSRID(ST_Point($1, $2), 4326)) as "distToIntersection"
      FROM lanes l
      JOIN intersections i ON l."intersectionId" = i.id
      WHERE ST_DWithin(l.geometry, ST_SetSRID(ST_Point($1, $2), 4326), 0.0001)
      ORDER BY ST_Distance(l.geometry, ST_SetSRID(ST_Point($1, $2), 4326)) ASC
      LIMIT 1
    `, [cam.longitude, cam.latitude]);

    console.log(spatialData);
    
    if (!spatialData.length) return null;

    const { laneId, intersectionId, isIncoming, distToIntersection } = spatialData[0];

    await this.redis.trackVehicle(intersectionId, cam.stationId, {
        isIncoming,
        laneId,
        distToIntersection
    });

    if (cam.vehicleType === 'EV' && cam.emergency.sirenOn && isIncoming) {
      return this.triggerEmergencyResponse(intersectionId, cam, laneId);
    }

    return null;
  }

  private async triggerEmergencyResponse(intersectionId: number, ev: CamPayload, evLaneId: number) {
    await this.redis.setIntersectionActive(intersectionId);

    const vehicleIds = await this.redis.getVehiclesAtIntersection(intersectionId);
    const alerts:any = [];

    alerts.push({
      topic: `v2x/downlink/denm/${ev.stationId}`,
      message: {
        type: 'DENM',
        role: 'EV_PRIORITY_CONFIRMATION',
        intersectionId,
        activeLanes: vehicleIds.length,
        action: 'PROCEED_WITH_CAUTION'
      }
    });

    for (const vId of vehicleIds) {
      if (vId === ev.stationId) continue;

      const vData = await this.redis.getVehicleData(vId);
      if (!vData || !vData.isIncoming) continue;

      const instruction = vData.laneId === evLaneId ? 'MOVE_RIGHT' : 'HOLD_POSITION';

      alerts.push({
        stationId: vId,
        topic: `v2x/downlink/denm/${vId}`,
        message: { 
          type: 'DENM',
          action: instruction, 
          cause: 'EMERGENCY_VEHICLE_APPROACHING',
          evMetadata: {
            stationId: ev.stationId,
            speed: ev.speed,
            heading: ev.heading,
          },
          intersectionId 
        }
      });
    }
    
    this.ingestionService.sendAlerts(alerts)
  }
}