import { Test, TestingModule } from '@nestjs/testing';
import { AssistantTemplateService } from './assistant-template.service';

describe('AssistantTemplateService', () => {
  let service: AssistantTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssistantTemplateService],
    }).compile();

    service = module.get<AssistantTemplateService>(AssistantTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
