// interfaces/template-repository.interface.ts

import { EmailTemplate } from '../entities/email-template.entity';

export interface ITemplateRepository {
  findById(id: string): Promise<EmailTemplate>;
}
