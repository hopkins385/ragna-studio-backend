import { Injectable } from '@nestjs/common';
import { TokenUsageRepository } from './repositories/token-usage.repository';
import { TokenUsagePayload } from './interfaces/token-usage-payload.interface';

@Injectable()
export class TokenUsageService {
  constructor(private readonly tokenUsageRepository: TokenUsageRepository) {}

  async logTokenUsage(payload: TokenUsagePayload): Promise<void> {
    await this.tokenUsageRepository.logTokenUsage(payload);
  }

  async getTokenUsageHistory(payload: {
    userId: string;
    from: {
      year: string;
      month: string;
      day?: string;
    };
    to: {
      year: string;
      month: string;
      day?: string;
    };
  }) {
    const fromDate = new Date(
      `${payload.from.year}-${payload.from.month}-${payload.from.day ?? '01'}`,
    );
    const toDate = new Date(
      `${payload.to.year}-${payload.to.month}-${payload.to.day ?? '31'}`,
    );

    return this.tokenUsageRepository.getAllTokenUsagesForUser({
      userId: payload.userId,
      period: {
        from: fromDate,
        to: toDate,
      },
    });
  }
}
