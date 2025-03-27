import { Inject, Injectable, Logger } from '@nestjs/common';
import { ToolProvider } from '../types/tool-provider';
import { z } from 'zod';
import { HTTP_CLIENT } from '@/modules/http-client/constants';
import { AxiosInstance } from 'axios';
import { ToolContext, ToolOptions } from '../interfaces/assistant-tool-function.interface';

interface RestApiResponse {
  message: string;
}

const restApiSchema = z.object({
  method: z
    .string()
    .min(3)
    .max(10)
    .refine((method) => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method), {
      message: 'Method must be one of GET, POST, PUT, PATCH, DELETE',
    })
    .describe('The HTTP method to use which must be one of GET, POST, PUT, PATCH, DELETE'),
  url: z.string().url().min(10).max(1000).describe('The URL of the REST API to call'),
  body: z.any().optional().describe('The request body object to send'),
});

type RestApiArgs = z.infer<typeof restApiSchema>;

@Injectable()
export class RestApiTool extends ToolProvider<RestApiArgs, RestApiResponse> {
  private readonly logger = new Logger(RestApiTool.name);

  constructor(@Inject(HTTP_CLIENT) private readonly httpClient: AxiosInstance) {
    super({
      name: 'restapi',
      description: 'Call a REST API',
      parameters: restApiSchema,
    });
  }

  async execute(
    args: RestApiArgs,
    context: ToolContext,
    options?: ToolOptions,
  ): Promise<RestApiResponse> {
    try {
      const response = await this.httpClient.request({
        method: args.method,
        url: args.url,
        data: args.body,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to call REST API: `, error);
      return { message: 'Failed to call REST API' };
    }
  }
}
