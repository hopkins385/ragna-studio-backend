import { Test, TestingModule } from '@nestjs/testing';
import { AssistantToolFunctionService } from './assistant-tool-function.service';

describe('AssistantToolFunctionService', () => {
  let service: AssistantToolFunctionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssistantToolFunctionService],
    }).compile();

    service = module.get<AssistantToolFunctionService>(AssistantToolFunctionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
