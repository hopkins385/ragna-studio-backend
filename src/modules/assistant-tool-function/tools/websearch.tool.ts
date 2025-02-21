import { Injectable, Logger } from '@nestjs/common';
import { ToolProvider } from '../types/tool-provider';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { BaseResponse, getJson } from 'serpapi';
import {
  ToolContext,
  ToolOptions,
} from '../interfaces/assistant-tool-function.interface';

interface WebSearchParams {
  query: string;
}

type WebSearchResponse = BaseResponse;

const webSearchSchema = {
  query: z.string().min(3).max(100).describe('The query to search the web for'),
} as const;

@Injectable()
export class WebSearchTool extends ToolProvider<
  WebSearchParams,
  WebSearchResponse
> {
  private readonly logger = new Logger(WebSearchTool.name);

  constructor(private readonly config: ConfigService) {
    super({
      name: 'searchWeb',
      description: 'Search the web',
      parameters: z.object(webSearchSchema),
    });
  }

  async execute(
    params: WebSearchParams,
    context: ToolContext,
    options?: ToolOptions,
  ): Promise<WebSearchResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await getJson({
        engine: 'google',
        api_key: this.config.getOrThrow<string>('SERP_API_KEY'),
        q: params.query,
        location: 'Berlin,Berlin,Germany',
      });

      // remove unnecessary properties
      delete response.search_metadata;
      delete response.search_parameters;
      delete response.related_searches;
      delete response.related_questions;
      delete response.pagination;
      delete response.serpapi_pagination;

      this.logger.debug(`Searched web: `, response);

      return response;
      //
    } catch (error) {
      this.logger.error(`Failed to search web: ${error}`);
      return { message: 'cannot search the web' };
    }
  }
}
