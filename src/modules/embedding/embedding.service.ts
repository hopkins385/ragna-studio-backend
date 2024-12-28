import { Injectable, Logger } from '@nestjs/common';
import {
  IEmbedFilePayload,
  RagDocument,
  SearchResultDocument,
} from './interfaces/emedding.interface';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

type EmbedFileResponse = RagDocument[];
type SearchVectorResponse = SearchResultDocument[];

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly embedFileUrl: string;
  private readonly searchVectorUrl: string;

  constructor(private readonly config: ConfigService) {
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
      const response = await axios.post<EmbedFileResponse>(
        this.embedFileUrl,
        payload,
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new Error('Sorry this service is currently unavailable');
    }
  }

  async deleteEmbeddings(payload: {
    mediaId: string;
    recordIds: string[];
  }): Promise<void> {
    try {
      const response = await axios.delete(this.embedFileUrl, {
        data: payload,
      });
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new Error('Sorry this service is currently unavailable');
    }
  }

  async searchDocsByQuery(payload: {
    query: string;
    recordIds: string[];
  }): Promise<SearchResultDocument[]> {
    try {
      const response = await axios.post<SearchVectorResponse>(
        this.searchVectorUrl,
        payload,
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new Error('Sorry this service is currently unavailable');
    }
  }
}
