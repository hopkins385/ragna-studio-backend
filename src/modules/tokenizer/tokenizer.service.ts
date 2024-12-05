import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { get_encoding, Tiktoken, TiktokenEncoding } from 'tiktoken';
import { TokenizerResponse } from './interfaces/tokenizer.res';

@Injectable()
export class TokenizerService {
  private readonly logger = new Logger(TokenizerService.name);
  private readonly model: TiktokenEncoding;
  private readonly encoder: Tiktoken;
  private readonly url: string;

  constructor(private readonly config: ConfigService) {
    const newUrl = new URL(
      '/api/v1/tokenize/text',
      this.config.get<string>('RAG_SERVER_URL'),
    );
    this.url = newUrl.toString();
    // local
    this.model = 'o200k_base';
    this.encoder = get_encoding(this.model);
  }

  async getTokens(
    content: string | undefined | null,
  ): Promise<{ tokens: Uint32Array; tokenCount: number; charCount: number }> {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        body: JSON.stringify({ text: content }),
        // timeout: 3000, // 3 seconds
      });
      const data = (await response.json()) as TokenizerResponse;
      const { tokens, tokenCount, charCount } = data;
      return { tokens: new Uint32Array(tokens), tokenCount, charCount };
    } catch (error) {
      // this.logger.debug(
      //   'Failed to get tokens from rag server, falling back to local',
      // );
      try {
        return await this.getTokensLocal(content);
      } catch (error) {
        throw new Error('TokenizerService getTokens: Failed to get tokens');
      }
    }
  }

  async getTokensLocal(
    content: string | undefined | null,
  ): Promise<{ tokens: Uint32Array; tokenCount: number; charCount: number }> {
    return new Promise((resolve, reject) => {
      if (!content || !content.length) {
        return reject('TokenizerService getTokens: Content is empty');
      }

      const tokens = this.encoder.encode(content);
      const tokenCount = tokens.length;
      const charCount = content.length;

      resolve({ tokens, tokenCount, charCount });
    });
  }

  async detokenize(tokens: Uint32Array): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      if (!tokens || !tokens.length) {
        return reject('TokenizerService detokenize: Tokens are empty');
      }

      const text = this.encoder.decode(tokens);

      resolve(text);
    });
  }
}
