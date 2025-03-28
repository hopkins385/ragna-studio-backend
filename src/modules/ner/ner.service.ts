import { HTTP_CLIENT } from '@/modules/http-client/constants';
import { NerExtractResponse } from '@/modules/ner/interfaces/ner-response.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosInstance } from 'axios';

/**
 * Service for Named Entity Recognition (NER). \
 * This service is responsible for handling NER-related operations. \
 * It uses an HTTP client to make requests to internal RAGNA NER MicroService.
 */
@Injectable()
export class NerService {
  private readonly logger = new Logger(NerService.name);
  private readonly nerServerUrl: string;

  constructor(
    private readonly config: ConfigService,
    @Inject(HTTP_CLIENT) private readonly httpClient: AxiosInstance,
  ) {
    this.nerServerUrl = this.config.get('NER_SERVER_URL');
  }

  /**
   * Extracts named entities from the given text.
   * @param payload - The payload containing the text to be processed and optional labels.
   * @returns A promise that resolves to the response from the internal NER server.
   */
  async extractEntities(payload: { text: string; labels?: string[] }): Promise<NerExtractResponse> {
    try {
      const response = await this.httpClient.post<NerExtractResponse>(
        this.nerServerUrl + '/ner/extract',
        {
          text: payload.text,
          labels: payload.labels,
        },
      );

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        this.logger.error(`Error extracting entities: ${error.code} - ${error.message}`);
      }
      throw new Error(`Failed to extract entities`);
    }
  }
}
