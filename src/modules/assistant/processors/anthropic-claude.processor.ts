import {
  OnQueueEvent,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AssistantService } from '../assistant.service';

@Processor('anthropic-claude-3-5-sonnet-20240620', {
  concurrency: 10,
  limiter: { max: 1, duration: 1000 },
})
export class AnthropicClaudeProcessor extends WorkerHost {
  private readonly logger = new Logger(AnthropicClaudeProcessor.name);

  constructor(private readonly assistantService: AssistantService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    let progress = 0;
    /*await new Promise((resolve) => {
      const interval = setInterval(() => {
        progress += 10;
        job.updateProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve(null);
        }
      }, 1000);
    });*/
    // just wait for 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {};
  }

  @OnWorkerEvent('ready')
  onReady() {
    this.logger.log('Worker ready');
  }

  @OnWorkerEvent('active')
  onActive(job: Job<any, any, string>) {
    this.logger.log(`Job started with data ${job.data}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<any, any, string>) {
    this.logger.log(`Job completed with result ${job.returnvalue}`);
  }
}
