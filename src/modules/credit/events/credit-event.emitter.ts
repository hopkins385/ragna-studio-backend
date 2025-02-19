// credit-event.emitter.ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreditEvent } from '../enums/credit-event.enum';
import { CreditEventDto } from './credit-event.dto';

@Injectable()
export class CreditEventEmitter {
  constructor(private eventEmitter: EventEmitter2) {}

  emitCreditUsage(payload: { userId: string; creditAmount: number }) {
    this.eventEmitter.emit(
      CreditEvent.Used,
      CreditEventDto.fromInput({
        userId: payload.userId,
        creditAmount: payload.creditAmount,
      }),
    );
  }
}
