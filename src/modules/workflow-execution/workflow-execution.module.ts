import { QueueModule } from './../queue/queue.module';
import { Module } from '@nestjs/common';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowExecutionController } from './workflow-execution.controller';
import { WorkflowModule } from '../workflow/workflow.module';
import { WorkflowQueueCompletedProcessor } from './processors/workflow-queue-completed.processor';
import { SocketModule } from '../socket/socket.module';
import { WorkflowEventListener } from './listeners/workflow-event.listener';

@Module({
  imports: [QueueModule, SocketModule, WorkflowModule],
  controllers: [WorkflowExecutionController],
  providers: [
    WorkflowExecutionService,
    // processors
    WorkflowQueueCompletedProcessor,
    // listeners
    WorkflowEventListener,
  ],
})
export class WorkflowExecutionModule {}
