import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingService } from '../embedding/embedding.service';
import { AxiosInstance } from 'axios';
import { HTTP_CLIENT } from '../http-client/constants';
import { tool } from 'ai';
import { z } from 'zod';
import {
  EmitToolInfoData,
  GetToolPayload,
  RagToolOptions,
  Tools,
} from './interfaces/assistant-tool-function.interface';
import { getJson } from 'serpapi';
import { ScrapeWebsiteResult } from './interfaces/scrape-website-result.interface';

@Injectable()
export class AssistantToolFunctionService {
  private readonly logger = new Logger(AssistantToolFunctionService.name);

  private availableTools: Record<string, ReturnType<any>> = {};

  constructor(
    private readonly config: ConfigService,
    private readonly embeddingService: EmbeddingService,
    @Inject(HTTP_CLIENT) private readonly httpClient: AxiosInstance,
  ) {
    this.availableTools = [
      {
        id: 1,
        name: 'searchWeb',
        tool: this.createWebSearchTool,
      },
      {
        id: 2,
        name: 'website',
        tool: this.createScrapeWebsiteTool,
      },
      {
        id: 3,
        name: 'retrieveSimilarDocuments',
        tool: this.createRagTool,
      },
    ];
  }

  public getTools(payload: GetToolPayload, options?: any): Tools | undefined {
    const tools: Tools = {};

    if (!payload.functionIds || payload.functionIds.length < 1) {
      return undefined;
    }

    const filteredTools = this.availableTools.filter((tool) =>
      payload.functionIds.includes(tool.id),
    );

    for (const toolConfig of filteredTools) {
      tools[toolConfig.name] = toolConfig.tool(
        payload.emitToolInfoData,
        options,
      );
    }

    return tools;
  }

  // Web Search Tool
  createWebSearchTool(emitToolInfoData: EmitToolInfoData, options?: any) {
    return tool({
      description: 'Search the web',
      parameters: z.object({
        query: z
          .string()
          .min(3)
          .max(100)
          .describe('The query to search the web for'),
      }),
      execute: async ({ query }) => {
        emitToolInfoData({ toolName: 'searchWeb', toolInfo: `${query}` });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await this.searchWeb(query);
      },
    });
  }

  async searchWeb(query: string, options?: any) {
    try {
      const response = await getJson({
        engine: 'google',
        api_key: this.config.getOrThrow<string>('SERP_API_KEY'),
        q: query,
        location: 'Berlin,Berlin,Germany',
      });
      return response;
    } catch (error: any) {
      return { message: 'cannot search the web' };
    }
  }

  // Scrape Tool
  createScrapeWebsiteTool(emitToolInfoData: EmitToolInfoData, options?: any) {
    return tool({
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
      execute: async ({ url }) => {
        emitToolInfoData({ toolName: 'website', toolInfo: `${url}` });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await this.scrapeWebsite(new URL(url));
      },
    });
  }

  async scrapeWebsite(
    websiteURL: URL,
    options?: any,
  ): Promise<ScrapeWebsiteResult> {
    const scrapeServerUrl = this.config.getOrThrow('SCRAPE_SERVER_URL');
    try {
      // check if its a valid url
      const isValidUrl = websiteURL.protocol === 'https:';
      if (!isValidUrl) {
        throw new Error('Invalid URL');
      }
      // scrape the website
      // `${scrapeServerUrl}/scrape?url=${url.toString()}`;
      const scrapeUrl = new URL(
        `${scrapeServerUrl}/scrape?url=${websiteURL.toString()}`,
      );
      const response = await this.httpClient.get(scrapeUrl.toString());
      if (response.status !== 200) {
        throw new Error('Failed to scrape');
      }
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to scrape website: ${error}; ${error?.errors}`);
      return {
        meta: null,
        body: 'cannot visit website. does it exist?',
      };
    }
  }

  // RAG Tool
  createRagTool(emitToolInfoData: EmitToolInfoData, options: RagToolOptions) {
    return tool({
      description: 'Search for similar documents',
      parameters: z.object({
        searchQuery: z.string().min(3).max(100).describe('The search query'),
      }),
      execute: async ({ searchQuery }) => {
        emitToolInfoData({
          toolName: 'retrieveSimilarDocuments',
          toolInfo: `${searchQuery}`,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await this.retrieveSimilarDocuments(searchQuery, options);
      },
    });
  }

  async retrieveSimilarDocuments(query: string, options: RagToolOptions) {
    const recordIds = options.recordIds;
    if (!recordIds) {
      throw new Error('Record IDs are required');
    }
    try {
      return await this.embeddingService.searchDocsByQuery({
        query,
        recordIds,
      });
    } catch (error: any) {
      this.logger.error(`Failed to retrieve similar documents: ${error}`);
      return [];
    }
  }
}
