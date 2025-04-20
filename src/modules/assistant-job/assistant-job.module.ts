import { Module } from '@nestjs/common';
import { AssistantToolFunctionModule } from '../assistant-tool-function/assistant-tool-function.module';
import { DocumentItemModule } from '../document-item/document-item.module';
import { TokenUsageModule } from './../token-usage/token-usage.module';
import { AssistantJobService } from './assistant-job.service';
import {
  AnthropicClaudeSonnet20250219Processor,
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
  imports: [TokenUsageModule, DocumentItemModule, AssistantToolFunctionModule],
  providers: [
    AssistantJobService,
    // processors
    AnthropicClaudeSonnetProcessor,
    AnthropicClaudeSonnetLatestProcessor,
    AnthropicClaudeSonnet20250219Processor,
    MistralLargeProcessor,
    OpenaiGpt4oProcessor,
    OpenaiGpt4oMiniProcessor,
    OpenaiO1Processor,
    OpenaiO3MiniProcessor,
  ],
})
export class AssistantJobModule {}
