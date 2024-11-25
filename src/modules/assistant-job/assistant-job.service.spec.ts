import { Test, TestingModule } from '@nestjs/testing';
import { AssistantJobService } from './assistant-job.service';

describe('AssistantJobService', () => {
  let service: AssistantJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssistantJobService],
    }).compile();

    service = module.get<AssistantJobService>(AssistantJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
