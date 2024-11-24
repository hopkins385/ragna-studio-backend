import { QueueModule } from './../queue/queue.module';
import { Module } from '@nestjs/common';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowExecutionController } from './workflow-execution.controller';
import { WorkflowModule } from '../workflow/workflow.module';
import { WorkflowQueueCompletedProcessor } from './processors/workflow-queue-completed.processor';

@Module({
  imports: [QueueModule, WorkflowModule],
  controllers: [WorkflowExecutionController],
  providers: [
    WorkflowExecutionService,
    // processors
    WorkflowQueueCompletedProcessor,
  ],
})
export class WorkflowExecutionModule {}
