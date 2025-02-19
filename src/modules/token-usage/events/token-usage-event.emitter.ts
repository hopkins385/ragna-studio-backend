// token-usage-event.emitter.ts
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TokenUsageEvent } from '../enums/token-usage-event.enum';
import { TokenUsageEventDto } from './token-usage-event.dto';

@Injectable()
export class TokenUsageEventEmitter {
  constructor(private eventEmitter: EventEmitter2) {}

  emitTokenUsage(payload: TokenUsageEventDto): void {
    this.eventEmitter.emit(TokenUsageEvent.LOG_USAGE, payload);
  }
}
