import { ChatEventEmitter } from '@/modules/chat/events/chat-event.emitter';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseResponse as SerpBaseResponse, getJson } from 'serpapi';
import { z } from 'zod';
import { ToolContext, ToolOptions } from '../interfaces/assistant-tool-function.interface';
import { ToolProvider } from '../types/tool-provider';

const webSearchSchema = z.object({
  query: z.string().min(3).max(1000).describe('The query to search the web for'),
});

type WebSearchArgs = z.infer<typeof webSearchSchema>;
type WebSearchResponse = SerpBaseResponse;

@Injectable()
export class WebSearchTool extends ToolProvider<WebSearchArgs, WebSearchResponse> {
  private readonly logger = new Logger(WebSearchTool.name);

  constructor(
    private readonly chatEventEmitter: ChatEventEmitter,
    private readonly config: ConfigService,
  ) {
    super({
      name: 'searchWeb',
      description: 'Search the web',
      parameters: webSearchSchema,
    });
  }

  async execute(
    args: WebSearchArgs,
    context: ToolContext,
    options?: ToolOptions,
  ): Promise<WebSearchResponse> {
    this.emitToolStartCallEvent(this.chatEventEmitter, {
      userId: context.userId,
      chatId: context.chatId,
      toolInfo: `${args.query}`,
    });

    try {
      const response = await getJson({
        engine: 'google',
        api_key: this.config.getOrThrow<string>('SERP_API_KEY'),
        q: args.query,
        location: 'Berlin,Berlin,Germany',
      });

      // remove unnecessary properties
      delete response.search_metadata;
      delete response.search_parameters;
      delete response.related_searches;
      delete response.related_questions;
      delete response.pagination;
      delete response.serpapi_pagination;

      return response;
      //
    } catch (error) {
      this.logger.error(`Failed to search web: ${error}`);
      return { message: 'cannot search the web' };
    }
  }
}
