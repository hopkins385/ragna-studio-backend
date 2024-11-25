import { AssistantRepository } from './repositories/assistant.repository';
import { Module } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';
import { AssistantToolModule } from '../assistant-tool/assistant-tool.module';

@Module({
  imports: [AssistantToolModule],
  controllers: [AssistantController],
  providers: [AssistantRepository, AssistantService],
  exports: [AssistantService],
})
export class AssistantModule {}
