import { CreditRepository } from './repositories/credit.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreditService {
  constructor(private readonly creditRepo: CreditRepository) {}

  createCredit(userId: string, amount: number) {
    return this.creditRepo.prisma.credit.create({
      data: {
        userId: userId.toLowerCase(),
        amount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  getCreditAmount(userId: string) {
    return this.creditRepo.prisma.credit.findFirst({
      select: {
        amount: true,
      },
      where: {
        userId: userId.toLowerCase(),
      },
    });
  }

  updateCredit(userId: string, amount: number) {
    return this.creditRepo.prisma.credit.update({
      where: {
        userId: userId.toLowerCase(),
      },
      data: {
        amount,
        updatedAt: new Date(),
      },
    });
  }

  reduceCredit(userId: string, amount: number) {
    return this.creditRepo.prisma.credit.update({
      where: {
        userId: userId.toLowerCase(),
      },
      data: {
        amount: {
          decrement: amount,
        },
        updatedAt: new Date(),
      },
    });
  }

  deleteCredit(userId: string) {
    return this.creditRepo.prisma.credit.delete({
      where: {
        userId: userId.toLowerCase(),
      },
    });
  }

  softDeleteCredit(userId: string) {
    return this.creditRepo.prisma.credit.update({
      where: {
        userId: userId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
