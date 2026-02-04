import { forwardRef, Module } from '@nestjs/common';
import { SpatialEngineService } from './spatial_engine.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lane, Intersection } from './entities/entities';
import { RedisModule } from 'src/redis/redis.module';
import { IngestionModule } from 'src/ingestion/ingestion.module';

@Module({
  providers: [SpatialEngineService],
  imports: [TypeOrmModule.forFeature([Lane, Intersection]), RedisModule, forwardRef(() => IngestionModule)],
  exports: [SpatialEngineService]
})
export class SpatialEngineModule {}
