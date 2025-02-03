import { ConfigService } from '@nestjs/config';
import { ProviderType } from '../enums/provider.enum';

export type ProviderClass = new (
  model: string,
  config: ConfigService,
) => { createModel(): any };

export interface ProviderModelConfig {
  provider: ProviderType;
  model: string;
  structuredOutput?: boolean;
}
