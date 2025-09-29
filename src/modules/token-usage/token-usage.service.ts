import { TokenUsageEntity } from '@/modules/token-usage/entities/token-usage.entity';
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
        'claude-sonnet-4',
        {
          inputTokenPrice: 300,
          outputTokenPrice: 1500,
          currency: 'USD',
        },
      ],
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
        'o1',
        {
          inputTokenPrice: 1500,
          outputTokenPrice: 6000,
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
      [
        'o3',
        {
          inputTokenPrice: 1000,
          outputTokenPrice: 4000,
          currency: 'USD',
        },
      ],
      [
        'o3-mini',
        {
          inputTokenPrice: 110,
          outputTokenPrice: 440,
          currency: 'USD',
        },
      ],
    ]),
  ],
]);

const ragnaPricing = {
  percentage: 0.15, // / 100, // 15% of the total price
};

function getLlmPricing({ provider, model }: { provider: string; model: string }): LlmPricing {
  // Get the provider map
  const providerPricing = llmPricing.get(provider);
  if (!providerPricing) {
    return {
      inputTokenPrice: 0,
      outputTokenPrice: 0,
      currency: 'USD',
    };
  }

  // Find the model pricing (with partial matching)
  let modelPricing: LlmPricing | undefined;
  // Iterate through the models to find a partial match
  for (const [modelName, pricing] of providerPricing.entries()) {
    if (modelName.includes(model) || model.includes(modelName)) {
      modelPricing = pricing;
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

  const conversionFactor = {
    divisor: 1000 * 1000 * 100,
  };

  return {
    inputTokenPrice: modelPricing.inputTokenPrice / conversionFactor.divisor,
    outputTokenPrice: modelPricing.outputTokenPrice / conversionFactor.divisor,
    currency: modelPricing.currency,
  };
}

@Injectable()
export class TokenUsageService {
  constructor(private readonly tokenUsageRepository: TokenUsageRepository) {}

  async logTokenUsage(payload: TokenUsagePayload): Promise<void> {
    await this.tokenUsageRepository.logTokenUsage(payload);
  }

  async getTokenUsageHistory(payload: TokenUsageHistoryPayload): Promise<TokenUsageEntity[]> {
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

    const PricingCalculator = {
      applyMarkup: (pricing: LlmPricing, markup: { percentage: number }): LlmPricing => {
        return {
          inputTokenPrice: pricing.inputTokenPrice * (1 + markup.percentage),
          outputTokenPrice: pricing.outputTokenPrice * (1 + markup.percentage),
          currency: pricing.currency,
        };
      },

      calculateTokenCosts: (
        pricing: LlmPricing,
        tokens: { prompt: number; completion: number },
      ): {
        promptPrice: number;
        completionPrice: number;
        totalPrice: number;
      } => {
        const promptPrice = pricing.inputTokenPrice * tokens.prompt;
        const completionPrice = pricing.outputTokenPrice * tokens.completion;

        return {
          promptPrice,
          completionPrice,
          totalPrice: promptPrice + completionPrice,
        };
      },

      formatPrices: (prices: {
        promptPrice: number;
        completionPrice: number;
        totalPrice: number;
      }): {
        promptPrice: number;
        completionPrice: number;
        totalPrice: number;
      } => {
        const formatter = {
          precision: 4,
          convert: (value: number): number => {
            // Parse the fixed string back to a number with 4 decimal places
            return parseFloat(value.toFixed(formatter.precision));
          },
        };

        return {
          promptPrice: formatter.convert(prices.promptPrice),
          completionPrice: formatter.convert(prices.completionPrice),
          totalPrice: formatter.convert(prices.totalPrice),
        };
      },
    };

    return usages.map((usage) => {
      const basePricing = getLlmPricing({
        provider: usage.llm.provider,
        model: usage.llm.apiName,
      });

      // Apply Ragna percentage markup using the calculator
      const pricingWithMarkup = PricingCalculator.applyMarkup(basePricing, ragnaPricing);

      // Calculate token costs
      const tokenUsage = {
        prompt: usage.promptTokens,
        completion: usage.completionTokens,
      };

      const calculatedPrices = PricingCalculator.calculateTokenCosts(pricingWithMarkup, tokenUsage);
      const formattedPrices = PricingCalculator.formatPrices(calculatedPrices);

      return TokenUsageEntity.fromInput({
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        createdAt: usage.createdAt,
        promptPrice: formattedPrices.promptPrice,
        completionPrice: formattedPrices.completionPrice,
        totalPrice: formattedPrices.totalPrice,
        llm: {
          provider: usage.llm.provider,
          displayName: usage.llm.displayName,
        },
      });
    });
  }
}
