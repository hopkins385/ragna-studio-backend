import { AssistantToolRepository } from './repositories/assistant-tool.repository';
import { Module } from '@nestjs/common';
import { AssistantToolService } from './assistant-tool.service';
import { AssistantToolController } from './assistant-tool.controller';

@Module({
  providers: [AssistantToolRepository, AssistantToolService],
  controllers: [AssistantToolController],
  exports: [AssistantToolService],
})
export class AssistantToolModule {}
