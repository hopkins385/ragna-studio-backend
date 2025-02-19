// credit.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreditUsageRepository } from '../repositories/credit-usage.repository';
import { CreditEvent } from '../enums/credit-event.enum';

@Injectable()
export class CreditEventListener {
  constructor(private creditUsageRepository: CreditUsageRepository) {}

  @OnEvent(CreditEvent.Used)
  async handleCreditUsedEvent(payload: {
    userId: string;
    creditAmount: number;
  }) {
    await this.creditUsageRepository.logCreditUsage(payload);
  }
}
