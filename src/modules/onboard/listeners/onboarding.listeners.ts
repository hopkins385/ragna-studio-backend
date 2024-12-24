import { MailService } from '@/modules/mail/mail.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OnboardingCompletedDto } from '@/modules/onboard/events/onboarding.event';
import { OnboardingEvent } from '@/modules/onboard/enums/onboarding-event.enum';

@Injectable()
export class OnboardingListeners {
  constructor(private readonly mailService: MailService) {}

  @OnEvent(OnboardingEvent.COMPLETED)
  async handleOnboardingCompletedEvent({
    userName,
    userEmail,
  }: OnboardingCompletedDto) {
    // send welcome email
    await this.sendWelcomeMail({
      name: userName,
      email: userEmail,
    });
  }

  async sendWelcomeMail({ name, email }: { name: string; email: string }) {
    const emailData = {
      to: { name, email },
      templateId: 'welcome-de',
      templateData: {
        name,
        activationLink: 'https://ragna.io',
      },
    };
    return this.mailService.sendTemplatedEmail(emailData);
  }
}
