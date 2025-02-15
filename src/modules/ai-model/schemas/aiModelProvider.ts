import { ConfigService } from '@nestjs/config';
import type { LanguageModelV1 } from 'ai';

export type AiReasoningEffort = 'low' | 'medium' | 'high';

export interface AiModelProviderOptions {
  structuredOutputs?: boolean;
  simulateStreaming?: boolean;
  parallelToolCalls?: boolean;
  reasoningEffort?: AiReasoningEffort;
}

export abstract class AiModelProvider {
  constructor(
    protected readonly model: string,
    protected readonly config: ConfigService,
    protected readonly options: AiModelProviderOptions,
  ) {}

  abstract createModel(): LanguageModelV1;
}
