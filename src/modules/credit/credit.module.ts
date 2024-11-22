import { CreditRepository } from './repositories/credit.repository';
import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';

@Module({
  providers: [CreditRepository, CreditService],
})
export class CreditModule {}
