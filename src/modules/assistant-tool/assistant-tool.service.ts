import { Injectable } from '@nestjs/common';
import { CreateAssistantToolDto } from './dto/create-assistant-tool.dto';
import { AssistantToolRepository } from './repositories/assistant-tool.repository';

@Injectable()
export class AssistantToolService {
  constructor(private readonly assistantToolRepo: AssistantToolRepository) {}

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
    return this.assistantToolRepo.prisma.tool.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      where: {
        deletedAt: null,
      },
      orderBy: {
        functionId: 'asc',
      },
    });
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
}
