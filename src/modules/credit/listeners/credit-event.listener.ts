// credit.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreditEvent } from '../enums/credit-event.enum';
import { CreditEventDto } from '../events/credit-event.dto';
import { CreditUsageService } from '../credit-usage.service';

@Injectable()
export class CreditEventListener {
  constructor(private creditUsageService: CreditUsageService) {}

  @OnEvent(CreditEvent.Used)
  async handleCreditUsedEvent(payload: CreditEventDto) {
    await this.creditUsageService.logCreditUsage({
      userId: payload.userId,
      creditAmount: payload.creditAmount,
    });
  }
}
