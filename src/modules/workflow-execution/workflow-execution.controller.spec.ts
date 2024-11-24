import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowExecutionController } from './workflow-execution.controller';
import { WorkflowExecutionService } from './workflow-execution.service';

describe('WorkflowExecutionController', () => {
  let controller: WorkflowExecutionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowExecutionController],
      providers: [WorkflowExecutionService],
    }).compile();

    controller = module.get<WorkflowExecutionController>(WorkflowExecutionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
