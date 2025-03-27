import { Injectable, Logger } from '@nestjs/common';
import { ToolProvider } from '../types/tool-provider';
import { z } from 'zod';
import { CollectionService } from '@/modules/collection/collection.service';
import { EmbeddingService } from '@/modules/embedding/embedding.service';
import { CollectionAbleDto } from '@/modules/collection-able/dto/collection-able.dto';
import { ToolContext, ToolOptions } from '../interfaces/assistant-tool-function.interface';
import { ChatEventEmitter } from '@/modules/chat/events/chat-event.emitter';
import { ChatToolCallEventDto } from '@/modules/chat/events/chat-tool-call.event';

interface KnowledgeToolResponse {
  content: string;
}

const knowledgeSchema = z.object({
  searchQuery: z
    .string()
    .min(3)
    .max(100)
    .describe('The improved user query to search the knowledge base for'),
});

type KnowledgeToolArgs = z.infer<typeof knowledgeSchema>;

@Injectable()
export class KnowledgeTool extends ToolProvider<KnowledgeToolArgs, KnowledgeToolResponse> {
  private readonly logger = new Logger(KnowledgeTool.name);

  constructor(
    private readonly chatEventEmitter: ChatEventEmitter,
    private readonly collectionService: CollectionService,
    private readonly embeddingService: EmbeddingService,
  ) {
    super({
      name: 'knowledge',
      description: 'Search the users knowledge base',
      parameters: knowledgeSchema,
    });
  }

  async execute(
    args: KnowledgeToolArgs,
    context: ToolContext,
    options?: ToolOptions,
  ): Promise<KnowledgeToolResponse> {
    if (!context.assistantId) {
      throw new Error('Assistant ID is required');
    }

    this.logger.debug(`Retrieving similar documents for query: ${args.searchQuery}`);

    this.emitToolStartCallEvent(this.chatEventEmitter, {
      userId: context.userId,
      chatId: context.chatId,
      toolInfo: `${args.searchQuery}`,
    });

    try {
      const collections = await this.collectionService.findAllWithRecordsFor(
        CollectionAbleDto.fromInput({
          id: context.assistantId,
          type: 'assistant',
        }),
      );

      if (collections.length < 1) {
        this.logger.error('No collections found');
        return { content: '' };
      }

      const recordIds = collections.map((c) => c.records.map((r) => r.id)).flat();

      const res = await this.embeddingService.searchDocsByQuery({
        query: args.searchQuery,
        recordIds,
      });

      const mergedDocTexts = res.map((r) => r?.text || '').join('\n\n');

      this.logger.debug(`Retrieved similar documents`, { mergedDocTexts });

      return { content: mergedDocTexts };
      //
    } catch (error) {
      this.logger.error(`Failed to retrieve similar documents: ${error}`);
      return { content: '' };
    }
  }
}
