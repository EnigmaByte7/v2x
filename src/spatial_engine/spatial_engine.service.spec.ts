import { Test, TestingModule } from '@nestjs/testing';
import { SpatialEngineService } from './spatial_engine.service';

describe('SpatialEngineService', () => {
  let service: SpatialEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpatialEngineService],
    }).compile();

    service = module.get<SpatialEngineService>(SpatialEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
