// credit-event.emitter.ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreditEvent } from '../enums/credit-event.enum';

@Injectable()
export class CreditEventEmitter {
  constructor(private eventEmitter: EventEmitter2) {}

  emitCreditUsage(userId: string, creditAmount: number, action: string) {
    this.eventEmitter.emit(CreditEvent.Used, {
      userId,
      creditAmount,
    });
  }
}
