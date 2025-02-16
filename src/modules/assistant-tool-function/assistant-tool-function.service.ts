import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingService } from '../embedding/embedding.service';
import { AxiosInstance } from 'axios';
import { HTTP_CLIENT } from '../http-client/constants';
import { tool } from 'ai';
import { z } from 'zod';
import {
  GetToolPayload,
  ToolContext,
  ToolDefinition,
  ToolOptions,
  Tools,
} from './interfaces/assistant-tool-function.interface';
import { getJson } from 'serpapi';
import { ScrapeWebsiteResult } from './interfaces/scrape-website-result.interface';
import { CollectionAbleDto } from '../collection-able/dto/collection-able.dto';
import { CollectionService } from '../collection/collection.service';

@Injectable()
export class AssistantToolFunctionService {
  private readonly logger = new Logger(AssistantToolFunctionService.name);

  private readonly toolDefinitions: ToolDefinition[] = [
    {
      id: 1,
      name: 'searchWeb',
      description: 'Search the web',
      parameters: z.object({
        query: z
          .string()
          .min(3)
          .max(100)
          .describe('The query to search the web for'),
      }),
      handler: async (
        params: { query: string },
        context: ToolContext,
        options?: ToolOptions,
      ) => {
        return this.searchWeb(params, context, options);
      },
    },
    {
      id: 2,
      name: 'website',
      description: 'Get information about a website',
      parameters: z.object({
        url: z
          .string()
          .url()
          .min(10)
          .max(1000)
          .refine((url) => url.startsWith('https://'), {
            message: 'URL must start with https://',
          })
          .describe('The URL of the website to scrape'),
      }),
      handler: async (
        params: { url: string },
        context: ToolContext,
        options?: ToolOptions,
      ) => {
        return this.scrapeWebsite(params, context, options);
      },
    },
    {
      id: 3,
      name: 'retrieveSimilarDocuments',
      description: 'Search in the users knowledge base',
      parameters: z.object({
        searchQuery: z
          .string()
          .min(3)
          .max(100)
          .describe('The improved user query to search the knowledge base for'),
      }),
      handler: async (
        params: { searchQuery: string },
        context: ToolContext,
        options?: ToolOptions,
      ) => {
        return this.retrieveSimilarDocuments(params, context, options);
      },
    },
  ];

  constructor(
    private readonly config: ConfigService,
    private readonly embeddingService: EmbeddingService,
    private readonly collectionService: CollectionService,
    @Inject(HTTP_CLIENT) private readonly httpClient: AxiosInstance,
  ) {}

  public getTools(
    payload: GetToolPayload,
    options?: ToolOptions,
  ): Tools | undefined {
    if (!payload.functionIds?.length) {
      return undefined;
    }

    const context: ToolContext = {
      assistantId: payload.assistantId,
      emitToolInfoData: payload.emitToolInfoData,
    };

    const tools: Tools = {};

    for (const availableTool of this.toolDefinitions) {
      if (payload.functionIds.includes(availableTool.id)) {
        tools[availableTool.name] = this.createTool(
          availableTool,
          context,
          options,
        );
      }
    }

    return tools;
  }

  private createTool(
    toolDef: ToolDefinition,
    context: ToolContext,
    options: ToolOptions,
  ) {
    return tool({
      description: toolDef.description,
      parameters: toolDef.parameters,
      execute: async (params: any) => {
        context.emitToolInfoData({
          toolName: toolDef.name,
          toolInfo: JSON.stringify(params),
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await toolDef.handler.bind(this)(params, context, options);
      },
    });
  }

  private async searchWeb(
    params: { query: string },
    context: ToolContext,
    options?: ToolOptions,
  ): Promise<any> {
    try {
      const response = await getJson({
        engine: 'google',
        api_key: this.config.getOrThrow<string>('SERP_API_KEY'),
        q: params.query,
        location: 'Berlin,Berlin,Germany',
      });

      this.logger.debug(`Searched web: ${response}`);

      return response;
    } catch (error) {
      this.logger.error(`Failed to search web: ${error}`);
      return { message: 'cannot search the web' };
    }
  }

  private async scrapeWebsite(
    params: { url: string },
    context: ToolContext,
    options?: ToolOptions,
  ): Promise<ScrapeWebsiteResult> {
    const scrapeServerUrl = this.config.getOrThrow('SCRAPE_SERVER_URL');
    const websiteURL = new URL(params.url);
    try {
      if (websiteURL.protocol !== 'https:') {
        throw new Error('Invalid URL protocol - must be HTTPS');
      }

      const scrapeUrl = new URL(`${scrapeServerUrl}/scrape`);
      scrapeUrl.searchParams.set('url', websiteURL.toString());

      const response = await this.httpClient.get<ScrapeWebsiteResult>(
        scrapeUrl.toString(),
      );

      if (response.status !== 200) {
        throw new Error('Failed to scrape');
      }

      this.logger.debug(`Scraped website: ${response.data.body}`);

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to scrape website: ${error}`);
      return {
        meta: null,
        body: 'cannot visit website. does it exist?',
      };
    }
  }

  private async retrieveSimilarDocuments(
    params: { searchQuery: string },
    context: ToolContext,
    options?: ToolOptions,
  ) {
    if (!context.assistantId) {
      throw new Error('Assistant ID is required');
    }

    this.logger.debug(
      `Retrieving similar documents for query: ${params.searchQuery}`,
    );

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

      const recordIds = collections
        .map((c) => c.records.map((r) => r.id))
        .flat();

      const res = await this.embeddingService.searchDocsByQuery({
        query: params.searchQuery,
        recordIds,
      });

      this.logger.debug(`Retrieved similar documents`, res);

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
