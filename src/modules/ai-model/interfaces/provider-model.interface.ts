import { ConfigService } from '@nestjs/config';
import { ProviderType } from '../enums/provider.enum';
import { AiModelProviderOptions } from '../schemas/aiModelProvider';

export type ProviderClass = new (
  model: string,
  config: ConfigService,
  options: AiModelProviderOptions,
) => { createModel(): any };

export interface ProviderModelConfig {
  provider: ProviderType;
  model: string;
}
