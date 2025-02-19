// credit-usage.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import { ExtendedPrismaClient } from '@/modules/database/prisma.extension';
import { CustomPrismaService } from 'nestjs-prisma';

@Injectable()
export class CreditUsageRepository {
  readonly prisma: ExtendedPrismaClient;
  constructor(
    @Inject('PrismaService')
    private readonly db: CustomPrismaService<ExtendedPrismaClient>,
  ) {
    this.prisma = this.db.client;
  }

  async logCreditUsage(data: { userId: string; creditAmount: number }) {
    const now = new Date();
    return this.prisma.creditUsage.create({
      data: {
        userId: data.userId,
        amount: data.creditAmount,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  async getTotalCreditUsage(userId: string): Promise<number> {
    const result = await this.prisma.creditUsage.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }
}
