import { Module } from '@nestjs/common';
import { AssistantTemplateService } from './assistant-template.service';
import { AssistantTemplateController } from './assistant-template.controller';
import { AssistantTemplateRepository } from './repositories/assistant-template.repository';

@Module({
  controllers: [AssistantTemplateController],
  providers: [AssistantTemplateRepository, AssistantTemplateService],
})
export class AssistantTemplateModule {}
