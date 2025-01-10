import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tool } from 'ai';
import { AxiosInstance } from 'axios';
import { getJson } from 'serpapi';
import { z } from 'zod';
import { ScrapeWebsiteResult } from './interfaces/scrape-website-result.interface';
import { ProviderType } from '../ai-model/enums/provider.enum';
import { jsonSchema } from 'ai';
import { HTTP_CLIENT } from '../http-client/constants';

/*
interface IExampleSchema {
  start: string;
  destination: string;
  waypoints?: string[];
}

const exampleSchema = jsonSchema<IExampleSchema>({
  type: 'object',
  properties: {
    start: { type: 'string', minLength: 1, maxLength: 100 },
    destination: { type: 'string', minLength: 1, maxLength: 100 },
    waypoints: {
      type: 'array',
      items: { type: 'string', minLength: 1, maxLength: 100 },
    },
  },
  required: ['start', 'destination'],
});

exampleSchema.validate({
  start: 'Berlin',
  destination: 'Hamburg',
  waypoints: ['Bremen'],
});
*/

export interface ToolInfoData {
  toolName: string;
  toolInfo: string;
}

// Define a type for the emitToolInfoData function
type EmitToolInfoData = (toolInfoData: ToolInfoData) => void;

interface IGetTool {
  llmProvider: string;
  llmName: string;
  functionIds: number[] | null;
  emitToolInfoData: EmitToolInfoData;
}

// Define a type for the tool configuration
interface ToolConfig {
  id: number;
  name: string;
  description: string;
  parameters: Record<string, z.ZodType<any, any>>;
  execute: (params: any, emitToolInfoData: EmitToolInfoData) => Promise<any>;
}

// Define a type for the tools object
type Tools = Record<
  string,
  ReturnType<typeof ChatToolService.prototype.createTool>
>;

@Injectable()
export class ChatToolService {
  private readonly logger = new Logger(ChatToolService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(HTTP_CLIENT)
    private readonly httpClient: AxiosInstance,
  ) {}
  // Define tool configurations
  toolConfigs: ToolConfig[] = [
    {
      id: 4,
      name: 'directions',
      description:
        'Get directions between two or more locations and optional including waypoints',
      parameters: {
        start: z.string().min(1).max(100).describe('The starting location'),
        destination: z
          .string()
          .min(1)
          .max(100)
          .describe('The destination location'),
        waypoints: z
          .array(z.string().min(1).max(100))
          .optional()
          .describe('The waypoints to visit along the way'),
      },
      execute: async ({ start, destination, waypoints }, emitToolInfoData) => {
        emitToolInfoData({
          toolName: 'directions',
          toolInfo: `${start} to ${destination}`,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await this.getGoogleMapsDirections(
          start,
          destination,
          waypoints,
        );
      },
    },
    // {
    //   id: 3,
    //   name: 'imageGenerator',
    //   description: 'Generates an image by describing it',
    //   parameters: {
    //     imageDescription: z.string().min(1).max(4000).describe('The text to describe an image'),
    //   },
    //   execute: async ({ imageDescription }, emitToolInfoData) => {
    //     emitToolInfoData({ toolName: 'imageGenerator', toolInfo: `${imageDescription}` });
    //     return await generateImage(imageDescription);
    //   },
    // },
    {
      id: 2,
      name: 'website',
      description: 'Get information about a website',
      parameters: {
        url: z
          .string()
          .url()
          .min(10)
          .max(1000)
          .refine((url) => url.startsWith('https://'), {
            message: 'URL must start with https://',
          })
          .describe('The URL of the website to get information about'),
      },
      execute: async ({ url }, emitToolInfoData) => {
        const newUrl = new URL(url);
        emitToolInfoData({ toolName: 'website', toolInfo: `${newUrl.href}` });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await this.scrapeWebsite(newUrl);
      },
    },
    {
      id: 1,
      name: 'searchWeb',
      description: 'Search the web',
      parameters: {
        query: z
          .string()
          .min(3)
          .max(100)
          .describe('The query to search the web for'),
      },
      execute: async ({ query }, emitToolInfoData) => {
        emitToolInfoData({ toolName: 'searchWeb', toolInfo: `${query}` });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await this.searchWeb(query);
      },
    },
  ];

  // Factory function to create a tool
  createTool(config: ToolConfig, emitToolInfoData: EmitToolInfoData) {
    return tool({
      description: config.description,
      parameters: z.object(config.parameters),
      execute: (params) => config.execute(params, emitToolInfoData),
    });
  }

  public getTools(payload: IGetTool): Tools | undefined {
    const tools: Tools = {};

    if (!payload.functionIds || payload.functionIds.length < 1) {
      return undefined;
    }

    if (
      payload.llmProvider === ProviderType.GROQ ||
      payload.llmProvider === ProviderType.MISTRAL
    ) {
      return undefined;
    }

    const filteredConfigs = this.toolConfigs.filter((config) =>
      payload.functionIds.includes(config.id),
    );

    for (const config of filteredConfigs) {
      tools[config.name] = this.createTool(config, payload.emitToolInfoData);
    }

    return tools;
  }

  // Tool functions

  async getGoogleMapsDirections(
    start: string,
    destination: string,
    waypoints: string[] | undefined,
  ) {
    throw new Error('Not implemented');
    return {
      start,
      destination,
      waypoints,
    };
  }

  async scrapeWebsite(websiteURL: URL): Promise<ScrapeWebsiteResult> {
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

  async searchWeb(query: string) {
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
}
