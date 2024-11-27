import { Injectable, Logger } from '@nestjs/common';
import {
  IEmbedFilePayload,
  RagDocument,
  SearchResultDocument,
} from './interfaces/emedding.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly embedFileUrl: string;
  private readonly searchVectorUrl: string;

  constructor(private readonly config: ConfigService) {
    const newEmbedFileUrl = new URL(
      `/api/v1/embed/file`,
      this.config.get<string>('RAG_SERVER_URL'),
    );
    const newSearchVectorUrl = new URL(
      `/api/v1/search/vector`,
      this.config.get<string>('RAG_SERVER_URL'),
    );
    this.embedFileUrl = newEmbedFileUrl.toString();
    this.searchVectorUrl = newSearchVectorUrl.toString();
  }

  async embedFile(
    payload: IEmbedFilePayload,
    options: { resetCollection?: boolean } = {},
  ): Promise<RagDocument[]> {
    try {
      const response = await fetch(this.embedFileUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to embed file');
      }

      return (await response.json()) as RagDocument[];
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
      await fetch(this.embedFileUrl, {
        method: 'DELETE',
        body: JSON.stringify(payload),
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
      const response = await fetch(this.searchVectorUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to search documents');
      }

      return (await response.json()) as SearchResultDocument[];
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new Error('Sorry this service is currently unavailable');
    }
  }
}
