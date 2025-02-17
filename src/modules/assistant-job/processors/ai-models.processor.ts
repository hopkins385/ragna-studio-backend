import { Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { AssistantJobService } from '../assistant-job.service';
import { AssistantBaseProcessor } from './assistant-base.processor';
import { workflowProcessors } from './assistant-processor.config';

export interface ProcessorFactory extends AssistantBaseProcessor {
  assistantJobService: AssistantJobService;
}

function createProcessorConfig(processorName: string) {
  return (
    workflowProcessors.find((p) => p.name === processorName) ?? {
      name: processorName,
      title: processorName,
      options: {},
    }
  );
}

export function createProcessor(
  processorName: string,
  Base: typeof AssistantBaseProcessor,
): new (...args: any[]) => ProcessorFactory {
  const config = createProcessorConfig(processorName);
  const className = `${config.title}Processor`;

  @Processor(config.name, config.options)
  class ProcessorImpl extends Base {
    constructor(readonly assistantJobService: AssistantJobService) {
      const logger = new Logger(className);
      super(assistantJobService, logger);
    }
  }

  Object.defineProperty(ProcessorImpl, 'name', { value: className });

  return ProcessorImpl;
}
