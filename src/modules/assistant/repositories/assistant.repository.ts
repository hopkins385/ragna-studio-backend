import { ExtendedPrismaClient } from '@/modules/database/prisma.extension';
import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';

interface CreateAssistantPayload {
  teamId: string;
  llmId: string;
  title: string;
  description: string;
  systemPrompt: string;
  isShared: boolean;
  tools: string[];
}

interface CreateAssistantFromTemplatePayload {
  teamId: string;
  language: 'de' | 'en';
  templateId: string;
}

@Injectable()
export class AssistantRepository {
  readonly prisma: ExtendedPrismaClient;
  constructor(
    @Inject('PrismaService')
    private readonly db: CustomPrismaService<ExtendedPrismaClient>,
  ) {
    this.prisma = this.db.client;
  }

  // *~ CREATE ~* //

  async createAssistant(payload: CreateAssistantPayload) {
    return this.prisma.assistant.create({
      data: {
        teamId: payload.teamId,
        llmId: payload.llmId,
        title: payload.title,
        description: payload.description,
        systemPrompt: payload.systemPrompt,
        isShared: payload.isShared,
        systemPromptTokenCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        tools: {
          createMany: {
            data: payload.tools.map((toolId) => ({
              toolId,
            })),
          },
        },
      },
    });
  }

  async createAssistantFromTemplate(
    payload: CreateAssistantFromTemplatePayload,
  ) {
    // find template
    const template = await this.prisma.assistantTemplate.findFirst({
      select: {
        id: true,
        llmId: true,
        assistantTitle: true,
        assistantDescription: true,
        assistantSystemPrompt: true,
        assistantToolIds: true,
      },
      where: {
        id: payload.templateId,
        deletedAt: null,
      },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    const templateSystemPrompt =
      template.assistantSystemPrompt[payload.language];

    const data: CreateAssistantPayload = {
      teamId: payload.teamId,
      llmId: template.llmId,
      title: template.assistantTitle,
      description: template.assistantDescription,
      systemPrompt: templateSystemPrompt,
      isShared: false,
      tools: [], // TODO: add tools
      // tools: template.assistantToolIds,
    };

    // create assistant
    return this.createAssistant(data);
  }

  // *~ READ ~* //

  async getAssistant({ assistantId }: { assistantId: string }) {
    return this.prisma.assistant.findFirst({
      where: {
        id: assistantId,
      },
    });
  }

  async getManyAssistants({
    teamId,
    assistantIds,
  }: {
    teamId: string;
    assistantIds: string[];
  }) {
    return this.prisma.assistant.findMany({
      where: {
        teamId,
        id: {
          in: assistantIds,
        },
      },
    });
  }

  async getAssistantWithRelations(payload: { assistantId: string }) {
    return this.prisma.assistant.findFirst({
      relationLoadStrategy: 'join',
      where: {
        id: payload.assistantId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        systemPrompt: true,
        isShared: true,
        systemPromptTokenCount: true,
        llm: {
          select: {
            id: true,
            apiName: true,
            displayName: true,
            provider: true,
            hidden: true,
            capabilities: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            organisation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tools: {
          select: {
            toolId: true,
          },
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  async getAssistantDetails({ assistantId }: { assistantId: string }) {
    return this.prisma.assistant.findFirst({
      where: {
        id: assistantId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        systemPrompt: false,
        isShared: true,
        systemPromptTokenCount: false,
      },
    });
  }

  async getAllAssistants({
    teamId,
    searchQuery,
    page,
    limit,
  }: {
    teamId: string;
    searchQuery: string;
    page: number;
    limit: number;
  }) {
    return this.prisma.assistant
      .paginate({
        select: {
          id: true,
          title: true,
          description: true,
          isShared: true,
          llm: {
            select: {
              provider: true,
              displayName: true,
            },
          },
        },
        where: {
          teamId,
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
  }

  // *~ UPDATE ~* //

  async updateAssistant({
    teamId,
    assistantId,
    title,
    llmId,
    description,
    systemPrompt,
    isShared,
    hasKnowledgeBase,
    hasWorkflow,
  }: {
    teamId: string;
    assistantId: string;
    title: string;
    llmId: string;
    description: string;
    systemPrompt: string;
    isShared: boolean;
    hasKnowledgeBase: boolean;
    hasWorkflow: boolean;
  }) {
    return this.prisma.assistant.update({
      where: {
        teamId,
        id: assistantId,
      },
      data: {
        title,
        llmId,
        description,
        systemPrompt,
        isShared,
        systemPromptTokenCount: 1,
        hasKnowledgeBase,
        hasWorkflow,
        updatedAt: new Date(),
      },
    });
  }

  async updateAssistantHasKnowledgeBase({
    teamId,
    assistantId,
    hasKnowledgeBase,
  }: {
    teamId: string;
    assistantId: string;
    hasKnowledgeBase: boolean;
  }) {
    return this.prisma.assistant.update({
      where: {
        teamId,
        id: assistantId,
      },
      data: {
        hasKnowledgeBase,
        updatedAt: new Date(),
      },
    });
  }

  // *~ DELETE ~* //

  async softDeleteAssistant({
    teamId,
    assistantId,
  }: {
    teamId: string;
    assistantId: string;
  }) {
    return this.prisma.assistant.update({
      where: {
        teamId,
        id: assistantId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async hardDeleteAssistant({
    teamId,
    assistantId,
  }: {
    teamId: string;
    assistantId: string;
  }) {
    return this.prisma.assistant.delete({
      where: {
        teamId,
        id: assistantId,
      },
    });
  }
}
