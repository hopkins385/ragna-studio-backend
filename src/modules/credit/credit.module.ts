import { Module } from '@nestjs/common';
import { CreditEventEmitter } from './events/credit-event.emitter';
import { CreditUsageRepository } from './repositories/credit-usage.repository';
import { CreditEventListener } from './listeners/credit-event.listener';
import { CreditUsageService } from './credit-usage.service';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';

@Module({
  providers: [
    CreditEventEmitter,
    CreditEventListener,
    CreditUsageRepository,
    CreditUsageService,
    CreditService,
  ],
  exports: [CreditEventEmitter, CreditUsageService, CreditService],
  controllers: [CreditController],
})
export class CreditModule {}
