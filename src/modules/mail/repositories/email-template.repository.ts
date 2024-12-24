// email/repositories/email-template.repository.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { ITemplateRepository } from '../interfaces/template-repository.interface';
import { EmailTemplate } from '../entities/email-template.entity';
import { readFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class EmailTemplateRepository implements ITemplateRepository {
  constructor() {}

  async findById(id: string): Promise<EmailTemplate> {
    const template = await this.findOne({ id });
    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    return template;
  }

  async findOne({ id }: { id: string }): Promise<EmailTemplate> {
    switch (id) {
      case 'welcome-en':
        return {
          id: 'welcome-en',
          subject: 'Welcome to RAGNA',
          content: await this.getFileContents('welcome-en'),
        };
        break;
      case 'welcome-de':
        return {
          id: 'welcome-de',
          subject: 'Willkommen auf RAGNA',
          content: await this.getFileContents('welcome-de'),
        };
        break;
      default:
        return null;
    }
  }

  async getFileContents(templateName: string): Promise<string> {
    const folder = join(__dirname, '..', 'templates');
    const extension = 'liquid';
    const templatePath = `${folder}/${templateName}.${extension}`;

    try {
      return await readFile(templatePath, 'utf8');
    } catch (error: any) {
      throw new Error(
        `Error reading template file: ${templatePath}, Error: ${error.message}`,
      );
    }
  }
}
