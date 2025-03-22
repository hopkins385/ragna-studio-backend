import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateAssistantToolDto } from './dto/create-assistant-tool.dto';
import { AssistantToolRepository } from './repositories/assistant-tool.repository';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AssistantToolService {
  private readonly logger = new Logger(AssistantToolService.name);

  constructor(
    private readonly assistantToolRepo: AssistantToolRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(payload: CreateAssistantToolDto) {
    const { assistantId, toolId } = payload;
    return this.assistantToolRepo.prisma.assistantTool.create({
      data: {
        assistantId,
        toolId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async updateById(id: string, payload: CreateAssistantToolDto) {
    const { assistantId, toolId } = payload;
    return this.assistantToolRepo.prisma.assistantTool.update({
      where: {
        id,
        assistantId,
        toolId,
      },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  async updateMany(assistantId: string, toolIds: string[]) {
    const assistantTools = await this.findMany(assistantId);
    const existingToolIds = assistantTools.map((t) => t.toolId);
    const newToolIds = toolIds.filter((t) => !existingToolIds.includes(t));
    const deleteToolIds = existingToolIds.filter((t) => !toolIds.includes(t));

    const createMany = this.assistantToolRepo.prisma.assistantTool.createMany({
      data: newToolIds.map((toolId) => ({
        assistantId,
        toolId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });

    const deleteMany = this.assistantToolRepo.prisma.assistantTool.deleteMany({
      where: {
        assistantId,
        toolId: {
          in: deleteToolIds,
        },
      },
    });

    return this.assistantToolRepo.prisma.$transaction([createMany, deleteMany]);
  }

  async findAll() {
    // const tools = await this.cacheManager.get('all-assistant-tools');
    // if (tools) {
    //   this.logger.debug(`returning cached tools`);
    //   return tools;
    // }
    const allTools = await this.assistantToolRepo.prisma.tool.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        iconName: true,
      },
      where: {
        deletedAt: null,
      },
      orderBy: {
        functionId: 'asc',
      },
    });
    await this.cacheManager.set('all-assistant-tools', allTools, 60 * 60 * 24 * 1000);
    return allTools;
  }

  async findFirst(assistantId: string, toolId: string) {
    return this.assistantToolRepo.prisma.assistantTool.findFirst({
      where: {
        assistantId,
        toolId,
        deletedAt: null,
      },
    });
  }

  async findMany(assistantId: string) {
    return this.assistantToolRepo.prisma.assistantTool.findMany({
      where: {
        assistantId,
        deletedAt: null,
      },
    });
  }

  async findManyByToolIds(assistantId: string, toolIds: string[]) {
    return this.assistantToolRepo.prisma.assistantTool.findMany({
      where: {
        assistantId,
        deletedAt: null,
        toolId: {
          in: toolIds,
        },
      },
    });
  }

  async findManyByAssistantIds(assistantIds: string[]) {
    return this.assistantToolRepo.prisma.assistantTool.findMany({
      where: {
        deletedAt: null,
        assistantId: {
          in: assistantIds,
        },
      },
    });
  }

  async delete(id: string, assistantId: string, toolId: string) {
    return this.assistantToolRepo.prisma.assistantTool.delete({
      where: {
        id,
        assistantId,
        toolId,
      },
    });
  }

  async deleteMany(assistantId: string, toolIds: string[]) {
    return this.assistantToolRepo.prisma.assistantTool.deleteMany({
      where: {
        assistantId,
        NOT: {
          toolId: {
            in: toolIds,
          },
        },
      },
    });
  }

  //
  async createToolCall(payload: {
    assistantId: string;
    toolId: string;
    input: string;
    output: string;
  }) {
    return this.assistantToolRepo.prisma.assistantToolCall.create({
      data: {
        assistantId: payload.assistantId,
        toolId: payload.toolId,
        input: payload.input,
        output: payload.output,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
