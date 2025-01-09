import { Test, TestingModule } from '@nestjs/testing';
import { AssistantTemplateController } from './assistant-template.controller';
import { AssistantTemplateService } from './assistant-template.service';

describe('AssistantTemplateController', () => {
  let controller: AssistantTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssistantTemplateController],
      providers: [AssistantTemplateService],
    }).compile();

    controller = module.get<AssistantTemplateController>(AssistantTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
