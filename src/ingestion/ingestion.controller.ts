import { Controller } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { Get } from '@nestjs/common';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Get()
  test() {
    return "hello"
  }  
}
