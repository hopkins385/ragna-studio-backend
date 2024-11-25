import { Job } from 'bullmq';
import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { AssistantJobService } from '../assistant-job.service';
import { DocumentProcessingStatus } from '@/modules/document-item/interfaces/processing-status.interface';

export abstract class AssistantBaseProcessor extends WorkerHost {
  constructor(readonly assistantJobService: AssistantJobService) {
    super();
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

  abstract process(job: Job): Promise<any>;
}
