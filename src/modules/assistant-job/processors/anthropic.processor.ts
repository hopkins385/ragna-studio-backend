import { LLM_MODEL } from '@/modules/llm/enums/llm-model.enum';
import { createProcessor, ProcessorFactory } from './ai-models.processor';
import { AssistantBaseProcessor } from './assistant-base.processor';

export const AnthropicClaudeSonnetProcessor: new (...args: any[]) => ProcessorFactory =
  createProcessor(LLM_MODEL.SONNET_20240620, AssistantBaseProcessor);

export const AnthropicClaudeSonnetLatestProcessor: new (...args: any[]) => ProcessorFactory =
  createProcessor(LLM_MODEL.SONNET_LATEST, AssistantBaseProcessor);

export const AnthropicClaudeSonnet20250219Processor: new (...args: any[]) => ProcessorFactory =
  createProcessor(LLM_MODEL.SONNET_20250219, AssistantBaseProcessor);
