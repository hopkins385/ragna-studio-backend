import { SessionModule } from '@/modules/session/session.module';
import { UserModule } from '@/modules/user/user.module';
import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { SlackModule } from '../slack/slack.module';
import { OnboardingListeners } from './listeners/onboarding.listeners';
import { OnboardController } from './onboard.controller';
import { OnboardService } from './onboard.service';
import { OnboardRepository } from './repositories/onboard.repository';

@Module({
  imports: [SlackModule, MailModule, UserModule, SessionModule],
  controllers: [OnboardController],
  providers: [OnboardRepository, OnboardService, OnboardingListeners],
})
export class OnboardModule {}
