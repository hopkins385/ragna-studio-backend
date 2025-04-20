import { LLM_MODEL } from '@/modules/llm/enums/llm-model.enum';
import { createProcessor, ProcessorFactory } from './ai-models.processor';
import { AssistantBaseProcessor } from './assistant-base.processor';

export const OpenaiGpt4oProcessor: new (...args: any[]) => ProcessorFactory = createProcessor(
  LLM_MODEL.GPT_4O,
  AssistantBaseProcessor,
);

export const OpenaiGpt4oMiniProcessor: new (...args: any[]) => ProcessorFactory = createProcessor(
  LLM_MODEL.GPT_4O_MINI,
  AssistantBaseProcessor,
);

export const OpenaiO3MiniProcessor: new (...args: any[]) => ProcessorFactory = createProcessor(
  LLM_MODEL.GPT_O3_MINI,
  AssistantBaseProcessor,
);

export const OpenaiO1Processor: new (...args: any[]) => ProcessorFactory = createProcessor(
  LLM_MODEL.GPT_O1,
  AssistantBaseProcessor,
);
