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

  async getUserCredits(userId: string): Promise<number> {
    const user = await this.creditUsageRepo.prisma.user.findUnique({
      where: { id: userId },
      select: { totalCredits: true },
    });
    return user?.totalCredits || 0;
  }

  async useCredits(
    userId: string,
    amount: number,
    action: string,
  ): Promise<void> {
    const user = await this.creditUsageRepo.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.totalCredits < amount) {
      throw new Error('Insufficient credits');
    }

    await this.creditUsageRepo.prisma.$transaction(async (prisma) => {
      // Update user's total credits
      await prisma.user.update({
        where: { id: userId },
        data: { totalCredits: { decrement: amount } },
      });

      // Log credit usage
      await prisma.creditUsage.create({
        data: {
          userId,
          amount,
        },
      });
    });

    // Emit credit usage event
    this.creditEventEmitter.emitCreditUsage(userId, amount, action);
  }

  async purchaseCredits(
    userId: string,
    amount: number,
    cost: number,
  ): Promise<void> {
    await this.creditUsageRepo.prisma.$transaction(async (prisma) => {
      // Update user's total credits
      await prisma.user.update({
        where: { id: userId },
        data: { totalCredits: { increment: amount } },
      });

      // Log credit purchase
      await prisma.creditPurchase.create({
        data: {
          userId,
          amount,
          cost,
        },
      });
    });

    // You might want to emit an event here as well
  }

  async getCreditUsageHistory(userId: string) {
    return this.creditUsageRepo.prisma.creditUsage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10, // Get last 10 usage records
    });
  }
}
