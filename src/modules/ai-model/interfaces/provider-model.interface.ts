import { ConfigService } from '@nestjs/config';
import { ProviderType } from '../enums/provider.enum';

export type ProviderClass = new (
  model: string,
  config: ConfigService,
) => { createModel(): any };

export interface ProviderModel {
  provider: ProviderType;
  model: string;
}
