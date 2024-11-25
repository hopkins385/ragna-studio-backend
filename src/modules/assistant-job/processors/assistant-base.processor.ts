import { Job } from 'bullmq';
import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { AssistantJobService } from '../assistant-job.service';
import { DocumentProcessingStatus } from '@/modules/document-item/interfaces/processing-status.interface';
import { Logger } from '@nestjs/common';

export abstract class AssistantBaseProcessor extends WorkerHost {
  constructor(
    readonly assistantJobService: AssistantJobService,
    readonly logger: Logger,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      return await this.handleJob(job);
    } catch (error: any) {
      this.logger.error(
        `Job processing failed: ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  @OnWorkerEvent('ready')
  onReady() {
    this.logger.log('Worker ready');
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    return this.handleJobStatus(job, 'pending');
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    return this.handleJobStatus(job, 'completed');
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    return this.handleJobStatus(job, 'failed');
  }

  protected async handleJobStatus(job: Job, status: DocumentProcessingStatus) {
    const { name, data } = job;
    switch (name) {
      case 'workflow-job':
        const result = await this.assistantJobService.updateWorkflowJobStatus(
          data,
          status,
        );
        return result;
        break;
      default:
        throw new Error(`Unknown job name: ${name}`);
    }
  }

  protected async handleJob(job: Job<any, any, string>) {
    const { name, data } = job;
    switch (name) {
      case 'workflow-job':
        return await this.assistantJobService.processWorkflowJob(data);
      default:
        throw new Error(`Unknown job name: ${name}`);
    }
  }
}
