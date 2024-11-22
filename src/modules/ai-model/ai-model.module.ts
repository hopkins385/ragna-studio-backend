import { Module } from '@nestjs/common';
import { AiModelFactory } from './factories/ai-model.factory';

@Module({
  imports: [],
  controllers: [],
  providers: [AiModelFactory],
  exports: [AiModelFactory],
})
export class AiModelModule {}
