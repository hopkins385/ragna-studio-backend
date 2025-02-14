import { OnboardRepository } from './repositories/onboard.repository';
import { Module } from '@nestjs/common';
import { OnboardService } from './onboard.service';
import { OnboardController } from './onboard.controller';
import { OnboardingListeners } from './listeners/onboarding.listeners';
import { SlackModule } from '../slack/slack.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [SlackModule, MailModule],
  controllers: [OnboardController],
  providers: [OnboardRepository, OnboardService, OnboardingListeners],
})
export class OnboardModule {}
