import { OnWorkerEvent, Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AssistantJobService } from '../assistant-job.service';
import { AssistantBaseProcessor } from './assistant-base.processor';
import { workflowProcessors } from './assistant-processor.config';

const providerLlmName = 'anthropic-claude-3-5-sonnet-20240620';

const PROCESSOR_CONFIG = workflowProcessors.find(
  (p) => p.name === providerLlmName,
) ?? {
  name: providerLlmName,
  options: {},
};

@Processor(PROCESSOR_CONFIG.name, PROCESSOR_CONFIG.options)
export class AnthropicClaudeSonnetProcessor extends AssistantBaseProcessor {
  private readonly logger = new Logger(AnthropicClaudeSonnetProcessor.name);

  constructor(readonly assistantJobService: AssistantJobService) {
    super(assistantJobService);
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

  async handleJob(job: Job<any, any, string>) {
    const { name, data } = job;
    switch (name) {
      case 'workflow-job':
        return await this.assistantJobService.processWorkflowJob(data);
      default:
        throw new Error(`Unknown job name: ${name}`);
    }
  }
}
