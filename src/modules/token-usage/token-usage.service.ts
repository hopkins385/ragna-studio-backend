import { Injectable } from '@nestjs/common';
import { TokenUsagePayload } from './interfaces/token-usage-payload.interface';
import { TokenUsageRepository } from './repositories/token-usage.repository';

interface TokenUsagePeriod {
  year: string;
  month: string;
  day?: string;
}

interface TokenUsageHistoryPayload {
  userId: string;
  from: TokenUsagePeriod;
  to: TokenUsagePeriod;
}

interface LlmPricing {
  inputTokenPrice: number;
  outputTokenPrice: number;
  currency: string;
}

interface ModelPricingMap extends Map<string, LlmPricing> {}

// Create a nested Map structure for provider -> model -> pricing
const llmPricing: Map<string, ModelPricingMap> = new Map([
  [
    'anthropic',
    new Map([
      [
        'claude-3-7-sonnet',
        {
          inputTokenPrice: 300,
          outputTokenPrice: 1500,
          currency: 'USD',
        },
      ],
      [
        'claude-3-5-sonnet',
        {
          inputTokenPrice: 300,
          outputTokenPrice: 1500,
          currency: 'USD',
        },
      ],
    ]),
  ],
  [
    'openai',
    new Map([
      [
        'gpt-4.5-preview',
        {
          inputTokenPrice: 7500,
          outputTokenPrice: 15000,
          currency: 'USD',
        },
      ],
      [
        'gpt-4o',
        {
          inputTokenPrice: 250,
          outputTokenPrice: 1000,
          currency: 'USD',
        },
      ],
      [
        'gpt-4o-mini',
        {
          inputTokenPrice: 15,
          outputTokenPrice: 60,
          currency: 'USD',
        },
      ],
      [
        'gpt-4.1',
        {
          inputTokenPrice: 200,
          outputTokenPrice: 800,
          currency: 'USD',
        },
      ],
      [
        'gpt-4.1-mini',
        {
          inputTokenPrice: 40,
          outputTokenPrice: 160,
          currency: 'USD',
        },
      ],
      [
        'o1-mini',
        {
          inputTokenPrice: 110,
          outputTokenPrice: 440,
          currency: 'USD',
        },
      ],
    ]),
  ],
]);

const ragnaPercent = 0.15 / 100; // 15% of the total price

function getLlmPricing(provider: string, model: string): LlmPricing {
  // Get the provider map
  const providerPricing = llmPricing.get(provider);
  if (!providerPricing) {
    throw new Error(`Provider ${provider} not found`);
  }

  // Find the model pricing (with partial matching)
  let modelPricing: LlmPricing | undefined;
  // Iterate through the models to find a partial match
  for (const [modelName, pricing] of providerPricing.entries()) {
    if (modelName.includes(model) || model.includes(modelName)) {
      modelPricing = pricing;
      // add ragnaPercent to the input and output token prices
      modelPricing.inputTokenPrice += modelPricing.inputTokenPrice * ragnaPercent;
      modelPricing.outputTokenPrice += modelPricing.outputTokenPrice * ragnaPercent;
      break;
    }
  }

  if (!modelPricing) {
    // set to zero
    modelPricing = {
      inputTokenPrice: 0,
      outputTokenPrice: 0,
      currency: 'USD',
    };
  }

  return {
    inputTokenPrice: modelPricing.inputTokenPrice / (1000 * 1000 * 100),
    outputTokenPrice: modelPricing.outputTokenPrice / (1000 * 1000 * 100),
    currency: modelPricing.currency,
  };
}

@Injectable()
export class TokenUsageService {
  constructor(private readonly tokenUsageRepository: TokenUsageRepository) {}

  async logTokenUsage(payload: TokenUsagePayload): Promise<void> {
    await this.tokenUsageRepository.logTokenUsage(payload);
  }

  async getTokenUsageHistory(payload: TokenUsageHistoryPayload) {
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

    return usages.map((usage) => {
      const { inputTokenPrice, outputTokenPrice } = getLlmPricing(
        usage.llm?.provider,
        usage.llm?.apiName,
      );

      const tempTotalPrice =
        inputTokenPrice * usage.promptTokens + outputTokenPrice * usage.completionTokens;

      return {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        createdAt: usage.createdAt,
        promptPrice: (inputTokenPrice * usage.promptTokens).toFixed(4),
        completionPrice: (outputTokenPrice * usage.completionTokens).toFixed(4),
        totalPrice: tempTotalPrice.toFixed(4),
        llm: {
          provider: usage.llm?.provider,
          displayName: usage.llm?.displayName,
        },
      };
    });
  }
}
