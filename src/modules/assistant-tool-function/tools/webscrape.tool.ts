import { Inject, Injectable, Logger } from '@nestjs/common';
import { ToolProvider } from '../types/tool-provider';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { HTTP_CLIENT } from '@/modules/http-client/constants';
import { AxiosInstance } from 'axios';

interface WebScrapeParams {
  url: string;
}

interface WebScrapeResponse {
  meta: any | null;
  body: string | null;
}

const webScrapeSchema = {
  url: z
    .string()
    .url()
    .min(10)
    .max(1000)
    .refine((url) => url.startsWith('https://'), {
      message: 'URL must start with https://',
    })
    .describe('The URL of the website to scrape'),
} as const;

@Injectable()
export class WebScrapeTool extends ToolProvider<
  WebScrapeParams,
  WebScrapeResponse
> {
  private readonly logger = new Logger(WebScrapeTool.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(HTTP_CLIENT) private readonly httpClient: AxiosInstance,
  ) {
    super({
      name: 'website',
      description: 'Get information about a website',
      parameters: z.object(webScrapeSchema),
    });
  }

  async execute(params: WebScrapeParams): Promise<WebScrapeResponse> {
    const scrapeServerUrl = this.config.getOrThrow('SCRAPE_SERVER_URL');
    const websiteURL = new URL(params.url);
    try {
      if (websiteURL.protocol !== 'https:') {
        throw new Error('Invalid URL protocol - must be HTTPS');
      }

      const scrapeUrl = new URL(`${scrapeServerUrl}/scrape`);
      scrapeUrl.searchParams.set('url', websiteURL.toString());

      const response = await this.httpClient.get<WebScrapeResponse>(
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
}
