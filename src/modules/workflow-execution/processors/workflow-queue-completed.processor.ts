import { WorkflowEvent } from '@/modules/workflow/enums/workflow-event.enum';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bullmq';

interface WorkflowCompletionData {
  row: number;
  userId: string;
  workflowId: string;
}

@Processor('workflow-row-completed')
export class WorkflowQueueCompletedProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowQueueCompletedProcessor.name);

  constructor(private readonly event: EventEmitter2) {
    super();
  }

  async process(job: Job<WorkflowCompletionData>): Promise<any> {
    const { data } = job;
    // TODO: Implement workflow row completion logic
    this.event.emit(WorkflowEvent.ROW_COMPLETED, data);

    return {
      completed: true,
    };
  }

  @OnWorkerEvent('ready')
  onReady() {
    this.logger.log('Worker ready');
  }

  /*
  @OnWorkerEvent('active')
  onActive(job: Job<WorkflowCompletionData>) {
    this.logger.log(`Job started with data ${job.data}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<WorkflowCompletionData>) {
    this.logger.log(`Job completed with result ${job.returnvalue}`);
  }
  */
}
