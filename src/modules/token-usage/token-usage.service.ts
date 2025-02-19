import { Injectable } from '@nestjs/common';
import { TokenUsageRepository } from './repositories/token-usage.repository';
import { TokenUsagePayload } from './interfaces/token-usage-payload.interface';

@Injectable()
export class TokenUsageService {
  constructor(private readonly tokenUsageRepository: TokenUsageRepository) {}

  async logTokenUsage(payload: TokenUsagePayload): Promise<void> {
    await this.tokenUsageRepository.logTokenUsage(payload);
  }
}
