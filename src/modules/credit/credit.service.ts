// credit.service.ts
import { Injectable } from '@nestjs/common';
import { CreditEventEmitter } from './events/credit-event.emitter';
import { CreditUsageRepository } from './repositories/credit-usage.repository';

@Injectable()
export class CreditService {
  constructor(
    private creditUsageRepo: CreditUsageRepository,
    private creditEventEmitter: CreditEventEmitter,
  ) {}

  async getUserCredits(payload: { userId: string }): Promise<number> {
    const user = await this.creditUsageRepo.prisma.user.findUnique({
      where: { id: payload.userId },
      select: { totalCredits: true },
    });
    return user?.totalCredits || 0;
  }

  async useCredits(payload: { userId: string; amount: number }): Promise<void> {
    const user = await this.creditUsageRepo.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user || user.totalCredits < payload.amount) {
      throw new Error('Insufficient credits');
    }

    await this.creditUsageRepo.prisma.$transaction(async (prisma) => {
      // Update user's total credits
      await prisma.user.update({
        where: { id: payload.userId },
        data: { totalCredits: { decrement: payload.amount } },
      });

      // Log credit usage
      await prisma.creditUsage.create({
        data: {
          userId: payload.userId,
          amount: payload.amount,
        },
      });
    });

    // Emit credit usage event
    this.creditEventEmitter.emitCreditUsage({
      userId: payload.userId,
      creditAmount: payload.amount,
    });
  }

  async purchaseCredits(payload: {
    userId: string;
    amount: number;
    cost: number;
  }): Promise<void> {
    await this.creditUsageRepo.prisma.$transaction(async (prisma) => {
      // Update user's total credits
      await prisma.user.update({
        where: { id: payload.userId },
        data: { totalCredits: { increment: payload.amount } },
      });

      // Log credit purchase
      await prisma.creditPurchase.create({
        data: {
          userId: payload.userId,
          amount: payload.amount,
          cost: payload.cost,
        },
      });
    });

    // You might want to emit an event here as well
  }

  async getCreditUsageHistory(payload: { userId: string }) {
    return this.creditUsageRepo.prisma.creditUsage.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 10, // Get last 10 usage records
    });
  }
}
