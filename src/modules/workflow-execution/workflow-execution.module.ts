import { QueueModule } from './../queue/queue.module';
import { Module } from '@nestjs/common';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowExecutionController } from './workflow-execution.controller';
import { WorkflowModule } from '../workflow/workflow.module';
import { WorkflowQueueCompletedProcessor } from './processors/workflow-queue-completed.processor';
import { SocketModule } from '../socket/socket.module';
import { WorkflowEventListener } from './listeners/workflow-event.listener';
import { BullModule } from '@nestjs/bullmq';
import { workflowProcessors } from '../assistant-job/processors/assistant-processor.config';

@Module({
  imports: [
    SocketModule,
    WorkflowModule,
    // Workflow queues
    BullModule.registerFlowProducer({
      name: 'workflow',
    }),
    BullModule.registerQueue({
      name: 'workflow-row-completed',
    }),
    ...workflowProcessors.map((p) =>
      BullModule.registerQueue({
        name: p.name,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      }),
    ),
  ],
  controllers: [WorkflowExecutionController],
  providers: [
    WorkflowExecutionService,
    // processors
    // hint: other workflow processors are registered in the assistant-job module
    WorkflowQueueCompletedProcessor,
    // listeners
    WorkflowEventListener,
  ],
})
export class WorkflowExecutionModule {}
