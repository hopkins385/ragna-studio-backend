import { Inject, Injectable, Logger } from '@nestjs/common';
import { LlmRepository } from './repositories/llm.repository';
import { LargeLangModel } from '@prisma/client';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(
    private readonly llmRepo: LlmRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  getModels() {
    return this.llmRepo.prisma.largeLangModel.findMany({
      select: {
        id: true,
        provider: true,
        apiName: true,
        displayName: true,
        capabilities: true,
        infos: true,
        hidden: true,
        free: true,
      },
    });
  }

  async getCachedModels(): Promise<Partial<LargeLangModel[]>> {
    const models = await this.cacheManager.get('llm-models');
    if (models) {
      this.logger.debug(`returning cached models`);
      return models as Partial<LargeLangModel[]>;
    }
    const freshModels = await this.getModels();
    await this.cacheManager.set('llm-models', freshModels, 60 * 60 * 24 * 1000);

    return freshModels as Partial<LargeLangModel[]>;
  }
}
