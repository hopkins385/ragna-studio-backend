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
    const toDate = new Date(`${payload.to.year}-${payload.to.month}-${payload.to.day ?? '31'}`);

    const usages = await this.tokenUsageRepository.getAllTokenUsagesForUser({
      userId: payload.userId,
      period: {
        from: fromDate,
        to: toDate,
      },
    });

    /* example response
            [{
            "promptTokens": 7024,
            "completionTokens": 1130,
            "totalTokens": 8154,
            "createdAt": "2025-04-01T09:15:32.570Z",
            "llm": {
                "provider": "anthropic",
                "displayName": "Claude 3.7 Sonnet",
                "llmPrices": [
                    {
                        "inputTokenPrice": 300,
                        "outputTokenPrice": 1500,
                        "currency": "USD"
                    }
                ]
            }
        }],
        */

    return usages.map((usage) => ({
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      createdAt: usage.createdAt,
      sumPromptPrice:
        (usage.llm?.llmPrices[0]?.inputTokenPrice / (1000 * 1000 * 100)) * usage.promptTokens,
      sumCompletionPrice:
        (usage.llm?.llmPrices[0]?.outputTokenPrice / (1000 * 1000 * 100)) * usage.completionTokens,
      llm: {
        provider: usage.llm?.provider,
        displayName: usage.llm?.displayName,
      },
    }));
  }
}
