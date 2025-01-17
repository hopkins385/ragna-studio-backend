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
          description: true,
          createdAt: true,
          updatedAt: true,
        },
        where: {
          title: {
            contains: searchQuery,
            mode: 'insensitive',
          },
          deletedAt: null,
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
      select: {
        id: true,
        llmId: true,
        title: true,
        description: true,
        config: true,
      },
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
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
        config: template.config,
      }),
    );
  }

  async findOne(templateId: string): Promise<AssistantTemplateEntity | null> {
    const template = await this.prisma.assistantTemplate.findUnique({
      select: {
        id: true,
        llmId: true,
        title: true,
        description: true,
      },
      where: {
        id: templateId,
        deletedAt: null,
      },
    });

    if (!template) {
      return null;
    }

    return AssistantTemplateEntity.fromInput({
      id: template.id,
      llmId: template.llmId,
      title: template.title,
      description: template.description,
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

  async findOneCategory(categoryId: string) {
    return this.prisma.assistantTemplateCategory.findUnique({
      where: { id: categoryId },
    });
  }

  async findTemplatesByCategory(id: string) {
    return this.prisma.assistantTemplateCategoryItem.findMany({
      where: {
        categoryId: id,
      },
    });
  }

  async findTemplatesByCategoryIds(categoryIds: string[]) {
    const MAX_TEMPLATES_PER_CATEGORY = 10;

    if (!categoryIds) {
      throw new Error('No category ids provided');
    }

    if (!categoryIds.length) {
      return [];
    }

    const itemsRelations =
      await this.prisma.assistantTemplateCategoryItem.findMany({
        select: {
          categoryId: true,
          templateId: true,
          category: {
            select: {
              name: true,
            },
          },
        },
        where: {
          categoryId: {
            in: categoryIds,
          },
        },
      });

    const templatesIds = itemsRelations.map((item) => item.templateId);

    const templates = await this.prisma.assistantTemplate.findMany({
      select: {
        id: true,
        llmId: true,
        title: true,
        description: true,
        config: true,
      },
      where: {
        id: {
          in: templatesIds,
        },
      },
    });

    // group by category Ids
    // and return for each category a configurable number of templates
    // the return shall be an array of categories with templates
    const templatesByCategory = categoryIds.map((categoryId) => {
      const templatesForCategory = templates.filter((template) =>
        itemsRelations.some(
          (item) =>
            item.categoryId === categoryId && item.templateId === template.id,
        ),
      );

      return {
        id: categoryId,
        name:
          itemsRelations.find((item) => item.categoryId === categoryId)
            ?.category.name || 'Unknown',
        templates: templatesForCategory.slice(0, MAX_TEMPLATES_PER_CATEGORY),
      };
    });

    return templatesByCategory;
  }

  async findTemplatesByCategoryIds_opti(ids: string[]) {
    const MAX_TEMPLATES_PER_CATEGORY = 10;

    if (!ids) {
      throw new Error('No category ids provided');
    }

    if (!ids.length) {
      return [];
    }

    const relationsWithTemplates =
      await this.prisma.assistantTemplateCategoryItem.findMany({
        where: {
          categoryId: {
            in: ids,
          },
        },
        select: {
          categoryId: true,
          category: {
            select: {
              name: true,
            },
          },
          template: {
            select: {
              id: true,
              llmId: true,
              title: true,
              description: true,
              config: true,
            },
          },
        },
      });

    const grouped = relationsWithTemplates.reduce(
      (acc, item) => {
        if (!acc[item.categoryId]) {
          acc[item.categoryId] = [];
        }
        if (acc[item.categoryId].length < MAX_TEMPLATES_PER_CATEGORY) {
          // @ts-ignore
          acc[item.categoryId].push(item.template);
        }
        return acc;
      },
      {} as Record<string, typeof relationsWithTemplates>,
    );

    return grouped;
  }
}
