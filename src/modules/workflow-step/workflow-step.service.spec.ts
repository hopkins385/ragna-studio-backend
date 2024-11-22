import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowStepService } from './workflow-step.service';

describe('WorkflowStepService', () => {
  let service: WorkflowStepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowStepService],
    }).compile();

    service = module.get<WorkflowStepService>(WorkflowStepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
