import { OnboardRepository } from './repositories/onboard.repository';
import { Module } from '@nestjs/common';
import { OnboardService } from './onboard.service';
import { OnboardController } from './onboard.controller';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [OnboardController],
  providers: [OnboardRepository, OnboardService],
})
export class OnboardModule {}
