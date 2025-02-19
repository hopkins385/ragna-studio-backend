// credit-usage.service.ts
import { Injectable } from '@nestjs/common';
import { CreditUsageRepository } from './repositories/credit-usage.repository';

interface LogCreditUsagePayload {
  userId: string;
  creditAmount: number;
}

@Injectable()
export class CreditUsageService {
  constructor(private creditUsageRepo: CreditUsageRepository) {}

  async logCreditUsage(payload: LogCreditUsagePayload): Promise<void> {
    await this.creditUsageRepo.logCreditUsage(payload);
  }

  async getCreditBalance(userId: string): Promise<number> {
    const user = await this.creditUsageRepo.prisma.user.findUnique({
      where: { id: userId },
    });
    const totalUsage = await this.creditUsageRepo.getTotalCreditUsage(userId);
    return (user?.totalCredits || 0) - totalUsage;
  }

  async addCredits(userId: string, amount: number): Promise<void> {
    await this.creditUsageRepo.prisma.user.update({
      where: { id: userId },
      data: { totalCredits: { increment: amount } },
    });
  }
}
