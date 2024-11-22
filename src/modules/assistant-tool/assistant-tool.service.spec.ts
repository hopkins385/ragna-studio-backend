import { Test, TestingModule } from '@nestjs/testing';
import { AssistantToolService } from './assistant-tool.service';

describe('AssistantToolService', () => {
  let service: AssistantToolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssistantToolService],
    }).compile();

    service = module.get<AssistantToolService>(AssistantToolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
