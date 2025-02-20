import { TokenUsageEventListener } from './listeners/token-usage-event.listener';
import { TokenUsageEventEmitter } from './events/token-usage-event.emitter';
import { Module } from '@nestjs/common';
import { TokenUsageService } from './token-usage.service';
import { TokenUsageRepository } from './repositories/token-usage.repository';
import { CreditModule } from '../credit/credit.module';
import { TokenUsageController } from './token-usage.controller';

@Module({
  imports: [CreditModule],
  providers: [
    TokenUsageEventEmitter,
    TokenUsageEventListener,
    TokenUsageRepository,
    TokenUsageService,
  ],
  exports: [TokenUsageEventEmitter, TokenUsageService],
  controllers: [TokenUsageController],
})
export class TokenUsageModule {}
