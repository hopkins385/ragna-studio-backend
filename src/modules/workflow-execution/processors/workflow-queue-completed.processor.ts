import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

interface WorkflowCompletionData {
  row: number;
  userId: string;
  workflowId: string;
}

@Processor('workflow-row-completed')
export class WorkflowQueueCompletedProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowQueueCompletedProcessor.name);

  async process(job: Job<WorkflowCompletionData>): Promise<any> {
    let progress = 0;
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      completed: true,
    };
  }

  @OnWorkerEvent('active')
  onActive(job: Job<WorkflowCompletionData>) {
    this.logger.log(`Job started with data ${job.data}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<WorkflowCompletionData>) {
    this.logger.log(`Job completed with result ${job.returnvalue}`);
  }
}
