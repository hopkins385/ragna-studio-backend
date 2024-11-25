import { Module } from '@nestjs/common';
import { AssistantJobService } from './assistant-job.service';
import { DocumentItemModule } from '../document-item/document-item.module';
import { AnthropicClaudeSonnetProcessor } from './processors/anthropic-claude.processor';
import { AnthropicClaudeSonnetLatestProcessor } from './processors/anthropic-claude-latest.processor';

@Module({
  imports: [DocumentItemModule],
  providers: [
    AssistantJobService,
    // processors
    AnthropicClaudeSonnetProcessor,
    AnthropicClaudeSonnetLatestProcessor,
  ],
})
export class AssistantJobModule {}
