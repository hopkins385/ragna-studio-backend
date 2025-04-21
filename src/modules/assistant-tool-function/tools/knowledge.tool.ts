import { ChatEventEmitter } from '@/modules/chat/events/chat-event.emitter';
import { CollectionAbleDto } from '@/modules/collection-able/dto/collection-able.dto';
import { CollectionService } from '@/modules/collection/collection.service';
import { EmbeddingService } from '@/modules/embedding/embedding.service';
import { MediaService } from '@/modules/media/media.service';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { ToolContext, ToolOptions } from '../interfaces/assistant-tool-function.interface';
import { ToolProvider } from '../types/tool-provider';

interface KnowledgeToolResult {
  content: string;
  metadata?: {
    media: {
      id: string | null;
      name: string | null;
      mimeType: string | null;
    };
  };
}

type KnowledgeToolResponse = KnowledgeToolResult[];

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
    private readonly mediaService: MediaService,
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
        return [{ content: '' }];
      }

      const recordIds = collections.map((c) => c.records.map((r) => r.id)).flat();

      const searchResults = await this.embeddingService.searchDocsByQuery({
        query: args.searchQuery,
        recordIds,
      });

      // this.logger.debug('searchResults', searchResults);

      const medias = await Promise.all(
        searchResults.map((r) => this.mediaService.findFirst(r.mediaId)),
      );

      const documents = searchResults.map((r) => {
        const media = medias.find((m) => m.id === r.mediaId);
        return {
          content: r.text,
          metadata: {
            media: {
              id: media?.id || null,
              name: media?.name || null,
              mimeType: media?.fileMime || null,
            },
          },
        };
      });

      // this.logger.debug(documents);

      return documents;
      //
    } catch (error) {
      this.logger.error(`Failed to retrieve similar documents: ${error}`);
      return [{ content: '' }];
    }
  }
}
