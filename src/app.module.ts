import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IngestionModule } from './ingestion/ingestion.module';
import { RedisModule } from './redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lane, Intersection } from './spatial_engine/entities/entities';
import { SpatialEngineModule } from './spatial_engine/spatial_engine.module';

@Module({
  imports: [IngestionModule, RedisModule, SpatialEngineModule, 
    TypeOrmModule.forRoot({
        type:'postgres',
        host: 'localhost',
        port: 5432,
        username: 'user',
        password: 'password',
        database: 'v2x_db',
        entities: [Intersection, Lane],
        synchronize: true,
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
