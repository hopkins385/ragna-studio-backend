import { Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { AssistantJobService } from '../assistant-job.service';
import { AssistantBaseProcessor } from './assistant-base.processor';
import { workflowProcessors } from './assistant-processor.config';
import { LLM_MODEL } from '@/modules/llm/enums/llm-model.enum';

/*const PROCESSOR = 'anthropic-claude-3-5-sonnet-20240620';
const PROCESSOR_CONFIG = workflowProcessors.find(
  (p) => p.name === PROCESSOR,
) ?? {
  name: PROCESSOR,
  options: {},
};

@Processor(PROCESSOR_CONFIG.name, PROCESSOR_CONFIG.options)
export class AnthropicClaudeSonnetProcessor extends AssistantBaseProcessor {
  constructor(readonly assistantJobService: AssistantJobService) {
    const logger = new Logger(AnthropicClaudeSonnetProcessor.name);
    super(assistantJobService, logger);
  }
}

const PROCESSOR2 = 'anthropic-claude-3-5-sonnet-latest';
const PROCESSOR_CONFIG2 = workflowProcessors.find(
  (p) => p.name === PROCESSOR2,
) ?? {
  name: PROCESSOR2,
  options: {},
};

@Processor(PROCESSOR_CONFIG2.name, PROCESSOR_CONFIG2.options)
export class AnthropicClaudeSonnetLatestProcessor extends AssistantBaseProcessor {
  constructor(readonly assistantJobService: AssistantJobService) {
    const logger = new Logger(AnthropicClaudeSonnetLatestProcessor.name);
    super(assistantJobService, logger);
  }
}*/

interface ProcessorFactory extends AssistantBaseProcessor {
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

function createProcessor(
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

export const AnthropicClaudeSonnetProcessor: new (
  ...args: any[]
) => ProcessorFactory = createProcessor(
  LLM_MODEL.SONNET_20240620,
  AssistantBaseProcessor,
);

export const AnthropicClaudeSonnetLatestProcessor: new (
  ...args: any[]
) => ProcessorFactory = createProcessor(
  LLM_MODEL.SONNET_LATEST,
  AssistantBaseProcessor,
);

export const GroqLlamaVisionProcessor: new (
  ...args: any[]
) => ProcessorFactory = createProcessor(
  LLM_MODEL.LLAMA_3_2_11B_LATEST,
  AssistantBaseProcessor,
);

export const MistralLargeProcessor: new (...args: any[]) => ProcessorFactory =
  createProcessor(LLM_MODEL.MISTRAL_LATEST, AssistantBaseProcessor);

export const OpenaiGpt4oProcessor: new (...args: any[]) => ProcessorFactory =
  createProcessor(LLM_MODEL.GPT_4O, AssistantBaseProcessor);

export const OpenaiGpt4oMiniProcessor: new (
  ...args: any[]
) => ProcessorFactory = createProcessor(
  LLM_MODEL.GPT_4O_MINI,
  AssistantBaseProcessor,
);
