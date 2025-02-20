// token-usage.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import { ExtendedPrismaClient } from '@/modules/database/prisma.extension';
import { CustomPrismaService } from 'nestjs-prisma';
import { TokenUsagePayload } from '../interfaces/token-usage-payload.interface';

@Injectable()
export class TokenUsageRepository {
  readonly prisma: ExtendedPrismaClient;

  constructor(
    @Inject('PrismaService')
    private readonly db: CustomPrismaService<ExtendedPrismaClient>,
  ) {
    this.prisma = this.db.client;
  }

  async logTokenUsage(payload: TokenUsagePayload) {
    const now = new Date();
    const totalTokens = payload.tokens.total;

    /*const llm = await this.prisma.largeLangModel.findUnique({
      select: {
        id: true,
        llmPrices: {
          select: { inputTokenPrice: true, outputTokenPrice: true },
          where: { expirationDate: { gte: now } },
        },
      },
      where: { id: payload.modelId },
    });

    if (!llm) {
      throw new Error('Language model not found');
    }

    const llmPrice = llm.llmPrices[0];
    const totalInputPrice =
      (llmPrice.inputTokenPrice / 1000) * payload.tokens.prompt;

    const totalOutputPrice =
      (llmPrice.outputTokenPrice / 1000) *
      (payload.tokens.completion + payload.tokens.reasoning);

    const totalPurchasePrice = totalInputPrice + totalOutputPrice;*/

    return this.prisma.tokenUsage.create({
      data: {
        userId: payload.userId,
        modelId: payload.modelId,
        promptTokens: payload.tokens.prompt,
        completionTokens: payload.tokens.completion,
        reasoningTokens: payload.tokens.reasoning,
        totalTokens,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  async getAllTokenUsagesForUser(payload: {
    userId: string;
    period: { from: Date; to: Date };
  }) {
    return this.prisma.tokenUsage.findMany({
      select: {
        totalTokens: true,
        createdAt: true,
        llm: {
          select: {
            provider: true,
            displayName: true,
          },
        },
      },
      where: {
        userId: payload.userId,
        createdAt: {
          gte: payload.period.from,
          lte: payload.period.to,
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getTotalTokenUsage(userId: string): Promise<number> {
    const result = await this.prisma.creditUsage.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }
}
