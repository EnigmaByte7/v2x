import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { CamController } from './mqtt-controllers/cam.mqtt-controller';
import { DiscoveryModule } from '@nestjs/core';
import { MqttExplorer } from './explorer/mqtt.explorer';
import { forwardRef } from '@nestjs/common';
import { SpatialEngineModule } from 'src/spatial_engine/spatial_engine.module';

@Module({
  imports: [DiscoveryModule, forwardRef(() => SpatialEngineModule)],
  controllers: [IngestionController],
  providers: [IngestionService, CamController,MqttExplorer],
  exports: [IngestionService]
})
export class IngestionModule {}
