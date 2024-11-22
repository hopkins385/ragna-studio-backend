import { LlmRepository } from './repositories/llm.repository';
import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';

@Module({
  controllers: [LlmController],
  providers: [LlmRepository, LlmService],
})
export class LlmModule {}
