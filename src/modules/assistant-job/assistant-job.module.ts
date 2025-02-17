import { Module } from '@nestjs/common';
import { AssistantJobService } from './assistant-job.service';
import { DocumentItemModule } from '../document-item/document-item.module';
import { AssistantToolFunctionModule } from '../assistant-tool-function/assistant-tool-function.module';
import {
  AnthropicClaudeSonnetLatestProcessor,
  AnthropicClaudeSonnetProcessor,
} from './processors/anthropic.processor';
import { MistralLargeProcessor } from './processors/mistral.processor';
import {
  OpenaiGpt4oMiniProcessor,
  OpenaiGpt4oProcessor,
  OpenaiO1Processor,
  OpenaiO3MiniProcessor,
} from './processors/openai.processor';

@Module({
  imports: [DocumentItemModule, AssistantToolFunctionModule],
  providers: [
    AssistantJobService,
    // processors
    AnthropicClaudeSonnetProcessor,
    AnthropicClaudeSonnetLatestProcessor,
    MistralLargeProcessor,
    OpenaiGpt4oProcessor,
    OpenaiGpt4oMiniProcessor,
    OpenaiO1Processor,
    OpenaiO3MiniProcessor,
  ],
})
export class AssistantJobModule {}
