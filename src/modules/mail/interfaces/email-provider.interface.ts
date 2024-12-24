// interfaces/email-provider.interface.ts

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailRecipient {
  name: string;
  email: string;
}

export interface IEmailProvider {
  sendEmail({
    to,
    subject,
    content,
  }: {
    to: EmailRecipient;
    subject: string;
    content: string;
  }): Promise<EmailResponse>;
}
