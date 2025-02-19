// token-usage-event.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TokenUsageEvent } from '../enums/token-usage-event.enum';
import { TokenUsageEventDto } from '../events/token-usage-event.dto';
import { TokenUsageService } from '../token-usage.service';

@Injectable()
export class TokenUsageEventListener {
  private readonly logger = new Logger(TokenUsageEventListener.name);

  constructor(private tokenUsageService: TokenUsageService) {}

  @OnEvent(TokenUsageEvent.LOG_USAGE)
  async handleTokenUsageEvent(payload: TokenUsageEventDto) {
    this.logger.debug(`Received token usage event`, payload);
    await this.tokenUsageService.logTokenUsage(payload);
  }
}
