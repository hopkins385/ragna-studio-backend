import { LLM_MODEL } from '@/modules/llm/enums/llm-model.enum';
import { createProcessor, ProcessorFactory } from './ai-models.processor';
import { AssistantBaseProcessor } from './assistant-base.processor';

export const MistralLargeProcessor: new (...args: any[]) => ProcessorFactory =
  createProcessor(LLM_MODEL.MISTRAL_LATEST, AssistantBaseProcessor);
