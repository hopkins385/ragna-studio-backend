import { AssistantRepository } from './repositories/assistant.repository';
import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { AssistantToolModule } from '../assistant-tool/assistant-tool.module';
import { AnthropicClaudeProcessor } from './processors/anthropic-claude.processor';

@Module({
  imports: [AssistantToolModule],
  controllers: [AssistantController],
  providers: [AssistantRepository, AssistantService, AnthropicClaudeProcessor],
  exports: [AssistantService],
})
export class AssistantModule {}
