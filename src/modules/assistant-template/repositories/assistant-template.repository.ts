import { AssistantTemplateEntity } from './../entities/assistant-template.entity';
import { ExtendedPrismaClient } from '@/modules/database/prisma.extension';
import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { AssistantTemplatesPaginated } from '../interfaces/assistent-template.interface';

@Injectable()
export class AssistantTemplateRepository {
  readonly prisma: ExtendedPrismaClient;

  constructor(
    @Inject('PrismaService')
    private readonly db: CustomPrismaService<ExtendedPrismaClient>,
  ) {
    this.prisma = this.db.client;
  }

  /**
   * Find all assistant templates
   */
  async findAll(): Promise<AssistantTemplateEntity[] | []> {
    const templates = await this.prisma.assistantTemplate.findMany();

    if (!templates) {
      return [];
    }

    return templates.map((template) =>
      AssistantTemplateEntity.fromInput({
        id: template.id,
        llmId: template.llmId,
        title: template.title,
        description: template.description,
        systemPrompt: template.systemPrompt,
      }),
    );
  }

  /**
   * Find all assistant templates paginated
   */
  async findAllPaginated(payload: {
    page: number;
    limit?: number;
    searchQuery?: string;
  }): Promise<AssistantTemplatesPaginated> {
    const page = payload.page || 1;
    const limit = payload.limit || 10;
    const searchQuery = payload.searchQuery || undefined;

    const [templates, meta] = await this.prisma.assistantTemplate
      .paginate({
        select: {
          id: true,
          llmId: true,
          title: true,
          systemPrompt: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
        where: {
          deletedAt: null,
          title: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      })
      .withPages({
        limit,
        page,
        includePageCount: true,
      });

    const templatesEntities = templates.map((template) =>
      AssistantTemplateEntity.fromInput({
        id: template.id,
        llmId: template.llmId,
        title: template.title,
        description: template.description,
        systemPrompt: template.systemPrompt,
      }),
    );

    return {
      templates: templatesEntities,
      meta,
    };
  }

  async findRandom(payload: {
    limit?: number;
  }): Promise<AssistantTemplateEntity[]> {
    const limit = payload.limit || 10;

    const templates = await this.prisma.assistantTemplate.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!templates) {
      return [];
    }

    return templates.map((template) =>
      AssistantTemplateEntity.fromInput({
        id: template.id,
        llmId: template.llmId,
        title: template.title,
        description: template.description,
        systemPrompt: template.systemPrompt,
      }),
    );
  }

  async findOne(id: string): Promise<AssistantTemplateEntity | null> {
    const template = await this.prisma.assistantTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return null;
    }

    return AssistantTemplateEntity.fromInput({
      id: template.id,
      llmId: template.llmId,
      title: template.title,
      description: template.description,
      systemPrompt: template.systemPrompt,
    });
  }

  async findAllCategories() {
    return this.prisma.assistantTemplateCategory.findMany();
  }

  async findAllCategoriesPaginated(payload: {
    page: number;
    limit?: number;
    searchQuery?: string;
  }) {
    const page = payload.page || 1;
    const limit = payload.limit || 10;
    const searchQuery = payload.searchQuery || undefined;

    return this.prisma.assistantTemplateCategory
      .paginate({
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
        where: {
          name: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      })
      .withPages({
        limit,
        page,
        includePageCount: true,
      });
  }

  async findOneCategory(id: string) {
    return this.prisma.assistantTemplateCategory.findUnique({
      where: { id },
    });
  }
}
