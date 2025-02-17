import { Module } from '@nestjs/common';
import { AssistantToolFunctionService } from './assistant-tool-function.service';
import { EmbeddingModule } from '@/modules/embedding/embedding.module';
import { CollectionModule } from '../collection/collection.module';
import { AssistantToolFactory } from './factories/assistant-tool.factory';
import { WebSearchTool } from './tools/websearch.tool';
import { WebScrapeTool } from './tools/webscrape.tool';
import { KnowledgeTool } from './tools/knowledge.tool';

@Module({
  imports: [EmbeddingModule, CollectionModule],
  providers: [
    // Tools
    AssistantToolFactory,
    WebSearchTool,
    WebScrapeTool,
    KnowledgeTool,
    // Services
    AssistantToolFunctionService,
  ],
  exports: [AssistantToolFunctionService],
})
export class AssistantToolFunctionModule {}
