import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AssistantTemplateRepository } from './repositories/assistant-template.repository';

@Injectable()
export class AssistantTemplateService {
  private readonly logger = new Logger(AssistantTemplateService.name);

  constructor(
    private readonly assistantTemplateRepo: AssistantTemplateRepository,
  ) {}

  async findAll() {
    return this.assistantTemplateRepo.findAll();
  }

  async findAllPaginated(payload: {
    page: number;
    limit?: number;
    searchQuery?: string;
  }) {
    return this.assistantTemplateRepo.findAllPaginated(payload);
  }

  async findOne(id: string) {
    return this.assistantTemplateRepo.findOne(id);
  }

  async findRandom(payload: { limit?: number }) {
    return this.assistantTemplateRepo.findRandom(payload);
  }

  async findAllCategories() {
    return this.assistantTemplateRepo.findAllCategories();
  }

  async findAllCategoriesPaginated(payload: {
    page: number;
    limit?: number;
    searchQuery?: string;
  }) {
    return this.assistantTemplateRepo.findAllCategoriesPaginated(payload);
  }

  async findOneCategory(id: string) {
    return this.assistantTemplateRepo.findOneCategory(id);
  }

  async findTemplatesByCategory(id: string) {
    return this.assistantTemplateRepo.findTemplatesByCategory(id);
  }

  async findTemplatesByCategoryIds(ids: string[]) {
    return this.assistantTemplateRepo.findTemplatesByCategoryIds(ids);
  }
}
