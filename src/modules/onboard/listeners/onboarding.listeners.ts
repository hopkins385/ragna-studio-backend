import { SlackService } from '@/modules/slack/slack.service';
import { MailService } from '@/modules/mail/mail.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OnboardingCompletedDto } from '@/modules/onboard/events/onboarding.event';
import { OnboardingEvent } from '@/modules/onboard/enums/onboarding-event.enum';

@Injectable()
export class OnboardingListeners {
  private readonly logger = new Logger(OnboardingListeners.name);

  constructor(
    private readonly mailService: MailService,
    private readonly slackService: SlackService,
  ) {}

  @OnEvent(OnboardingEvent.COMPLETED)
  async handleOnboardingCompletedEvent({
    userName,
    userEmail,
  }: OnboardingCompletedDto): Promise<void> {
    // send welcome email
    // await this.sendWelcomeMail({
    //   name: userName,
    //   email: userEmail,
    // });

    // send slack notification
    try {
      await this.sendNewUserSlackNotification();
      //
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to send slack notification: ${error.message}`,
        );
      }

      return;
    }
  }

  async sendWelcomeMail({ name, email }: { name: string; email: string }) {
    return this.mailService.sendTemplatedEmail({
      to: { name, email },
      templateId: 'welcome-de',
      templateData: {
        name,
        activationLink: 'https://ragna.io',
      },
    });
  }

  async sendNewUserSlackNotification() {
    const channel = '#appevents';
    const message = 'A new user has joined the platform!';
    return this.slackService.sendMessage({ channel, message });
  }
}
