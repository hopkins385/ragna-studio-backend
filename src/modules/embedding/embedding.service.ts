import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance } from 'axios';
import { HTTP_CLIENT } from '../http-client/constants';
import {
  IEmbedFilePayload,
  RagDocument,
  SearchResultDocument,
} from './interfaces/emedding.interface';

type EmbedFileResponse = RagDocument[];
type SearchVectorResponse = SearchResultDocument[];

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly embedFileUrl: string;
  private readonly searchVectorUrl: string;

  constructor(
    private readonly config: ConfigService,
    @Inject(HTTP_CLIENT)
    private readonly httpClient: AxiosInstance,
  ) {
    const ragServerUrl = this.config.getOrThrow<string>('RAG_SERVER_URL');
    const newEmbedFileUrl = new URL('/api/v1/embed/file', ragServerUrl);
    const newSearchVectorUrl = new URL('/api/v1/search/vector', ragServerUrl);
    this.embedFileUrl = newEmbedFileUrl.toString();
    this.searchVectorUrl = newSearchVectorUrl.toString();
  }

  async embedFile(
    payload: IEmbedFilePayload,
    options: { resetCollection?: boolean } = {},
  ): Promise<RagDocument[]> {
    try {
      this.logger.debug(
        `Embedding file with payload: ${JSON.stringify(payload)} and server url: ${this.embedFileUrl}`,
      );
      const response = await this.httpClient.post<EmbedFileResponse>(this.embedFileUrl, payload);
      return response.data;
      //
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw error;
    }
  }

  async deleteEmbeddings(payload: { mediaId: string; recordIds: string[] }): Promise<void> {
    try {
      const response = await this.httpClient.delete(this.embedFileUrl, {
        data: payload,
      });
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw error;
    }
  }

  async searchDocsByQuery(payload: {
    query: string;
    recordIds: string[];
  }): Promise<SearchResultDocument[]> {
    try {
      const response = await this.httpClient.post<SearchVectorResponse>(
        this.searchVectorUrl,
        payload,
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw error;
    }
  }
}
