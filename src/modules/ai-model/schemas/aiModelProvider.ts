import { ConfigService } from '@nestjs/config';
import type { LanguageModelV1 } from 'ai';

export interface AiModelProviderOptions {
  structuredOutputs?: boolean;
}

export abstract class AiModelProvider {
  constructor(
    protected readonly model: string,
    protected readonly config: ConfigService,
    protected readonly options: AiModelProviderOptions,
  ) {}

  abstract createModel(): LanguageModelV1;
}
