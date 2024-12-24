// entities/email-template.entity.ts

export class EmailTemplate {
  id: string;
  subject: string;
  content: string;
  metadata?: Record<string, any>;
}
