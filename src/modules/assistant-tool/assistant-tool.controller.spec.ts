import { Test, TestingModule } from '@nestjs/testing';
import { AssistantToolController } from './assistant-tool.controller';

describe('AssistantToolController', () => {
  let controller: AssistantToolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssistantToolController],
    }).compile();

    controller = module.get<AssistantToolController>(AssistantToolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
