import { AssistantRepository } from './repositories/assistant.repository';
import { Injectable } from '@nestjs/common';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';
import { FindAssistantDto } from './dto/find-assistant.dto';
import { FindAllAssistantsDto } from './dto/find-all-assistant.dto';
import { DeleteAssistantDto } from './dto/delete-assistant.dto';
import { AssistantToolService } from '../assistant-tool/assistant-tool.service';

@Injectable()
export class AssistantService {
  private defaultSystemPrompt: Record<string, string>;

  constructor(
    private readonly assistantRepository: AssistantRepository,
    private readonly assistantToolService: AssistantToolService,
  ) {
    this.defaultSystemPrompt = {
      de: `Sie sind ein freundlicher und hilfsbereiter Assistent.\n`,
      en: `You are a friendly and helpful assistant.\n`,
    };
  }

  async getSystemPrompt(lang: string, assistantId?: string) {
    if (!assistantId) {
      if (lang === 'de') {
        return this.defaultSystemPrompt.de;
      }
      return this.defaultSystemPrompt.en;
    }
    try {
      const assistant =
        await this.assistantRepository.prisma.assistant.findFirst({
          where: {
            id: assistantId,
          },
        });
      return assistant?.systemPrompt || '';
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  async create({
    teamId,
    llmId,
    title,
    description,
    systemPrompt,
    isShared,
    tools,
  }: CreateAssistantDto) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    return this.assistantRepository.prisma.assistant.create({
      data: {
        teamId,
        llmId,
        title,
        description,
        systemPrompt,
        isShared,
        systemPromptTokenCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        tools: {
          createMany: {
            data: tools.map((toolId) => ({
              toolId,
            })),
          },
        },
      },
    });
  }

  async findFirst({ assistantId }: FindAssistantDto) {
    if (!assistantId) {
      throw new Error('Assistant ID is required');
    }
    return this.assistantRepository.prisma.assistant.findFirst({
      relationLoadStrategy: 'join',
      where: {
        id: assistantId,
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

  async getDetails({ assistantId }: FindAssistantDto) {
    if (!assistantId) {
      throw new Error('Assistant ID is required');
    }
    return this.assistantRepository.prisma.assistant.findFirst({
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

  async findAll({ teamId, page, limit, searchQuery }: FindAllAssistantsDto) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    return this.assistantRepository.prisma.assistant
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

  async update({
    teamId,
    assistantId,
    title,
    llmId,
    description,
    systemPrompt,
    isShared,
    hasKnowledgeBase,
    hasWorkflow,
    tools,
  }: UpdateAssistantDto) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    const assistant = await this.assistantRepository.prisma.assistant.update({
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

    await this.assistantToolService.updateMany(assistantId, tools || []);

    return assistant;
  }

  async updateHasKnowledgeBase({
    teamId,
    assistantId,
    hasKnowledgeBase,
  }: Partial<UpdateAssistantDto>) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    return this.assistantRepository.prisma.assistant.update({
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

  async softDelete({ teamId, assistantId }: DeleteAssistantDto) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    return this.assistantRepository.prisma.assistant.update({
      where: {
        teamId,
        id: assistantId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async delete({ teamId, assistantId }: DeleteAssistantDto) {
    await this.assistantRepository.prisma.assistant.delete({
      where: {
        teamId,
        id: assistantId,
      },
    });
  }
}
