import { WorkflowRepository } from './repositories/workflow.repository';
import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { MediaAbleModule } from '../media-able/media-able.module';
import { WorkflowStepModule } from '../workflow-step/workflow-step.module';
import { WorkflowStepService } from '../workflow-step/workflow-step.service';

@Module({
  imports: [MediaAbleModule, WorkflowStepModule],
  controllers: [WorkflowController],
  providers: [WorkflowRepository, WorkflowService],
})
export class WorkflowModule {}
