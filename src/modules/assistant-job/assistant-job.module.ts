import { Module } from '@nestjs/common';
import { AssistantJobService } from './assistant-job.service';
import { DocumentItemModule } from '../document-item/document-item.module';
import {
  AnthropicClaudeSonnetLatestProcessor,
  AnthropicClaudeSonnetProcessor,
  GroqLlamaVisionProcessor,
  MistralLargeProcessor,
  OpenaiGpt4oMiniProcessor,
  OpenaiGpt4oProcessor,
} from './processors/ai-models.processor';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [DocumentItemModule, EmbeddingModule],
  providers: [
    AssistantJobService,
    // processors
    AnthropicClaudeSonnetProcessor,
    AnthropicClaudeSonnetLatestProcessor,
    GroqLlamaVisionProcessor,
    MistralLargeProcessor,
    OpenaiGpt4oProcessor,
    OpenaiGpt4oMiniProcessor,
  ],
})
export class AssistantJobModule {}
