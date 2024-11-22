import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tool } from 'ai';
import axios from 'axios';
import { getJson } from 'serpapi';
import { z } from 'zod';
import { ScrapeWebsiteResult } from './interfaces/scrape-website-result.interface';

export interface ToolInfoData {
  toolName: string;
  toolInfo: string;
}

// Define a type for the emitToolInfoData function
type EmitToolInfoData = (toolInfoData: ToolInfoData) => void;

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
  constructor(private readonly config: ConfigService) {}
  // Define tool configurations
  toolConfigs: ToolConfig[] = [
    {
      id: 1,
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
        return await this.getGoogleMapsDirections(
          start,
          destination,
          waypoints,
        );
      },
    },
    // {
    //   id: 2,
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
      id: 3,
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
        return this.scrapeWebsite(newUrl);
      },
    },
    {
      id: 4,
      name: 'youtubeTranscript',
      description: 'Get the transcript of a youtube video',
      parameters: {
        urlOrId: z
          .string()
          .describe(
            'The URL or video id of the youtube video to get the transcript of',
          ),
      },
      execute: async ({ urlOrId }, emitToolInfoData) => {
        emitToolInfoData({
          toolName: 'youtubeTranscript',
          toolInfo: `${urlOrId}`,
        });
        return this.scrapeYoutube(urlOrId);
      },
    },
    {
      id: 5,
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
        return this.searchWeb(query);
      },
    },
  ];

  // Factory function to create a tool
  createTool(config: ToolConfig, emitToolInfoData: EmitToolInfoData) {
    return tool({
      description: config.description,
      parameters: z.object(config.parameters),
      execute: async (params) => await config.execute(params, emitToolInfoData),
    });
  }

  getTools(
    functionIds: number[] | null = null,
    emitToolInfoData: EmitToolInfoData,
  ): Tools | undefined {
    const tools: Tools = {};

    if (!functionIds || functionIds.length < 1) {
      return undefined;
    }

    const filteredConfigs = this.toolConfigs.filter((config) =>
      functionIds.includes(config.id),
    );

    for (const config of filteredConfigs) {
      tools[config.name] = this.createTool(config, emitToolInfoData);
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

  async scrapeWebsite(url: URL): Promise<ScrapeWebsiteResult> {
    const scrapeServerUrl = this.config.getOrThrow('SCRAPE_SERVER_URL');
    try {
      // check if its a valid url
      const isValidUrl = url.protocol === 'https:';
      if (!isValidUrl) {
        throw new Error('Invalid URL');
      }
      // scrape the website
      const scrapeUrl = `${scrapeServerUrl}/scrape?url=${url.toString()}`;
      const response = await axios.get(scrapeUrl);
      if (response.status !== 200) {
        throw new Error('Failed to scrape');
      }
      return response.data;
    } catch (error) {
      return {
        meta: null,
        body: null,
        error: 'cannot scrape website. does it exist?',
      };
    }
  }

  async scrapeYoutube(urlOrId: string) {
    throw new Error('Not implemented');
    return {
      urlOrId,
    };
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
      return { error: 'cannot search the web' };
    }
  }
}
