import { ConfigService } from '@nestjs/config';
import { ProviderType } from '../enums/provider.enum';
import { AiModelProviderOptions } from '../schemas/aiModelProvider';
import { LanguageModelV1 } from 'ai';

export type ProviderClass = new (
  model: string,
  config: ConfigService,
  options: AiModelProviderOptions,
) => { createModel(): LanguageModelV1 };

export interface ProviderModelConfig {
  provider: ProviderType;
  model: string;
}
