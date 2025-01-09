import { Injectable } from '@nestjs/common';
import {
  EmailRecipient,
  EmailResponse,
  IEmailProvider,
} from '../interfaces/email-provider.interface';

//TODO: BrevoProvider API

@Injectable()
export class BrevoProvider implements IEmailProvider {
  // private readonly apiInstance: TransactionalEmailsApi;

  constructor(
    private readonly apiKey: string,
    private readonly fromEmail: string,
    private readonly fromName: string,
  ) {
    // this.apiInstance = new TransactionalEmailsApi();
    // this.apiInstance.setApiKey(
    //   TransactionalEmailsApiApiKeys.apiKey,
    //   this.apiKey,
    // );
  }

  async sendEmail(payload: {
    to: EmailRecipient;
    subject: string;
    content: string;
  }): Promise<EmailResponse> {
    /*const sendSmtpEmail = new SendSmtpEmail();

    sendSmtpEmail.subject = payload.subject;
    sendSmtpEmail.htmlContent = payload.content;
    sendSmtpEmail.to = [{ email: payload.to.email, name: payload.to.name }];

    sendSmtpEmail.sender = {
      name: this.fromName,
      email: this.fromEmail,
    };


    const { response, body } =
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      */

    return {
      success: true,
      messageId: '123',
      error: '',
    };
  }
}
