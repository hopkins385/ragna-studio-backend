import { ConfigService } from '@nestjs/config';
import type { LanguageModelV1 } from 'ai';

export abstract class AiModelProvider {
  constructor(
    protected readonly model: string,
    protected readonly config: ConfigService,
  ) {}

  abstract createModel(): LanguageModelV1;
}
