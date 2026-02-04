import { Injectable } from "@nestjs/common";
import { MqttController } from "../decorators/mqtt-controller.decorator";
import { CamPayload } from "src/shared/interfaces/cam.interface";
import { SpatialEngineService } from "src/spatial_engine/spatial_engine.service";

@Injectable()
export class CamController {
    constructor(private readonly spatialEngine: SpatialEngineService){}

    @MqttController('v2x/uplink/cam')
    handler(topic: string, payload: Buffer) {
        try {
            const data: CamPayload = JSON.parse(payload.toString())
            console.log(data);
            this.spatialEngine.processCam(data)
        }
        catch{
            console.log('failed');
        }
    }
}