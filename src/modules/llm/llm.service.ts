import { Injectable } from '@nestjs/common';
import { LlmRepository } from './repositories/llm.repository';
import { LargeLangModel } from '@prisma/client';

@Injectable()
export class LlmService {
  constructor(private readonly llmRepo: LlmRepository) {}

  getModels() {
    return this.llmRepo.prisma.largeLangModel.findMany({
      select: {
        id: true,
        provider: true,
        apiName: true,
        displayName: true,
        contextSize: true,
        maxTokens: true,
        multiModal: true,
        hidden: true,
        free: true,
      },
    });
  }

  async getCachedModels(): Promise<Partial<LargeLangModel[]>> {
    // const models = await useStorage('redis').getItem('llm-models');
    // if (models) {
    //   return models as Partial<LargeLangModel[]>;
    // }
    const freshModels = await this.getModels();
    // await useStorage('redis').setItem('llm-models', freshModels);
    return freshModels as Partial<LargeLangModel[]>;
  }
}
