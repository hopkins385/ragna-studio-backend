import { DirectionsTool } from '@/modules/assistant-tool-function/tools/directions.tool';
import { EditorCommentTool } from '@/modules/assistant-tool-function/tools/editor-comment.tool';
import { AssistantToolModule } from '@/modules/assistant-tool/assistant-tool.module';
import { ChatEventEmitter } from '@/modules/chat/events/chat-event.emitter';
import { EmbeddingModule } from '@/modules/embedding/embedding.module';
import { MediaModule } from '@/modules/media/media.module';
import { Module } from '@nestjs/common';
import { CollectionModule } from '../collection/collection.module';
import { AssistantToolFunctionService } from './assistant-tool-function.service';
import { AssistantToolFactory } from './factories/assistant-tool.factory';
import { KnowledgeTool } from './tools/knowledge.tool';
import { ThinkTool } from './tools/think.tool';
import { WebScrapeTool } from './tools/webscrape.tool';
import { WebSearchTool } from './tools/websearch.tool';

@Module({
  imports: [EmbeddingModule, CollectionModule, MediaModule, AssistantToolModule],
  providers: [
    // Tools
    AssistantToolFactory,
    WebSearchTool,
    WebScrapeTool,
    KnowledgeTool,
    EditorCommentTool,
    ThinkTool,
    DirectionsTool,
    // Services
    AssistantToolFunctionService,
    // Emitters
    ChatEventEmitter,
  ],
  exports: [AssistantToolFunctionService],
})
export class AssistantToolFunctionModule {}
