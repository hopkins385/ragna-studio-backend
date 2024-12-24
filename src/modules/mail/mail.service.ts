// email/email.service.ts

import { Injectable, Inject, Logger } from '@nestjs/common';
import { ITemplateEngine } from './interfaces/template-engine.interface';
import { ITemplateRepository } from './interfaces/template-repository.interface';
import {
  EmailRecipient,
  EmailResponse,
  IEmailProvider,
} from './interfaces/email-provider.interface';
import {
  EMAIL_PROVIDER,
  TEMPLATE_ENGINE,
  TEMPLATE_REPOSITORY,
} from './constants/injection-tokens';

export interface EmailData {
  to: EmailRecipient;
  templateId: string;
  templateData: Record<string, any>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
    @Inject(TEMPLATE_ENGINE)
    private readonly templateEngine: ITemplateEngine,
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templateRepository: ITemplateRepository,
  ) {}

  async sendTemplatedEmail(emailData: EmailData): Promise<EmailResponse> {
    try {
      const template = await this.templateRepository.findById(
        emailData.templateId,
      );

      const [renderedSubject, renderedContent] = await Promise.all([
        this.templateEngine.renderSubject(
          template.subject,
          emailData.templateData,
        ),
        this.templateEngine.render(template.content, emailData.templateData),
      ]);

      const recipient = {
        name: emailData.to.name,
        email: emailData.to.email,
      };

      return await this.emailProvider.sendEmail({
        to: recipient,
        subject: renderedSubject,
        content: renderedContent,
      });
      //
    } catch (error: any) {
      this.logger.error(error?.message, error?.stack);
      return {
        success: false,
        error: 'Failed to send email',
      };
    }
  }
}
