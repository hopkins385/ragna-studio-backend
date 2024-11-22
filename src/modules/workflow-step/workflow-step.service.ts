import { Injectable } from '@nestjs/common';
import { CreateWorkflowStepDto } from './dto/create-workflow-step.dto';
import {
  UpdateWorkflowStepAssistantDto,
  UpdateWorkflowStepDto,
} from './dto/update-workflow-step.dto';
import { WorkflowStepRepository } from './repositories/workflow-step.repository';
import { DocumentItemService } from '../document-item/document-item.service';
import { DocumentService } from '../document/document.service';
import { CreateDocumentDto } from '../document/dto/create-document.dto';
import { CreateDocumentItemDto } from '../document-item/dto/create-document-item.dto';
import { CreateWorkflowItemDto } from './dto/create-workflow-item.dto';

@Injectable()
export class WorkflowStepService {
  constructor(
    private readonly workflowStepRepo: WorkflowStepRepository,
    private readonly documentService: DocumentService,
    private readonly documentItemService: DocumentItemService,
  ) {}

  async create(payload: CreateWorkflowStepDto) {
    const workflow = await this.workflowStepRepo.prisma.workflow.findFirst({
      where: {
        id: payload.workflowId,
      },
      select: {
        id: true,
        teamId: true,
        steps: {
          select: {
            id: true,
          },
          where: {
            deletedAt: null,
          },
          orderBy: {
            orderColumn: 'asc',
          },
        },
      },
    });

    if (!workflow) {
      throw new Error(`Workflow with id ${payload.workflowId} not found`);
    }

    const docPayload = CreateDocumentDto.fromInput({
      name: 'Untitled Document',
      description: '',
      teamId: workflow.teamId,
      status: 'draft',
    });

    const document = await this.documentService.create(docPayload);
    const documentItemPayloads = [];
    for (let i = 0; i < payload.rowCount; i++) {
      const docItemPayload = CreateDocumentItemDto.fromInput({
        documentId: document.id,
        orderColumn: i,
        status: 'draft',
        type: 'text',
        content: '',
      });
      documentItemPayloads.push(docItemPayload);
    }

    await this.documentItemService.createMany(documentItemPayloads);

    const inputStepIds = workflow.steps.map((step) => step.id);

    const step = await this.workflowStepRepo.prisma.workflowStep.create({
      data: {
        type: 'text',
        workflowId: payload.workflowId,
        inputSteps: inputStepIds,
        documentId: document.id,
        assistantId: payload.assistantId,
        name: payload.name,
        description: payload.description,
        orderColumn: payload.orderColumn,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return step;
  }

  async createMany(payloads: CreateWorkflowStepDto[]) {
    const inputStepIds = [] as string[];
    for (const payload of payloads) {
      const docPayload = CreateDocumentDto.fromInput({
        name: 'Untitled Document',
        description: '',
        teamId: payload.teamId,
        status: 'draft',
      });
      const document = await this.documentService.create(docPayload);
      const documentItemPayloads = [];
      for (let i = 0; i < payload.rowCount; i++) {
        const docItemPayload = CreateDocumentItemDto.fromInput({
          documentId: document.id,
          orderColumn: i,
          status: 'draft',
          type: 'text',
          content: payload.rowContents ? payload.rowContents[i] : '',
        });
        documentItemPayloads.push(docItemPayload);
      }
      await this.documentItemService.createMany(documentItemPayloads);
      const step = await this.workflowStepRepo.prisma.workflowStep.create({
        data: {
          type: 'text',
          workflowId: payload.workflowId,
          assistantId: payload.assistantId,
          documentId: document.id,
          inputSteps: inputStepIds,
          name: payload.name,
          description: payload.description,
          orderColumn: payload.orderColumn,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      inputStepIds.push(step.id);
    }
  }

  async createRow(workflowId: string, items: CreateWorkflowItemDto[]) {
    const workflow = await this.workflowStepRepo.prisma.workflow.findFirst({
      where: {
        id: workflowId.toLowerCase(),
      },
      select: {
        id: true,
        teamId: true,
        steps: {
          select: {
            id: true,
          },
          where: {
            deletedAt: null,
          },
          orderBy: {
            orderColumn: 'asc',
          },
        },
      },
    });

    if (!workflow) {
      throw new Error(`Workflow with id ${workflowId} not found`);
    }

    const documentItemPayloads = [];
    for (const item of items) {
      const docItemPayload = CreateDocumentItemDto.fromInput({
        documentId: item.documentId,
        orderColumn: item.orderColumn,
        status: 'draft',
        type: item.type,
        content: item.content,
      });
      documentItemPayloads.push(docItemPayload);
    }

    await this.documentItemService.createMany(documentItemPayloads);

    return true;
  }

  findFirst(workflowStepId: string) {
    return this.workflowStepRepo.prisma.workflowStep.findFirst({
      where: {
        id: workflowStepId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  update(payload: UpdateWorkflowStepDto) {
    // only update the fields that are not undefined
    // if all fields are undefined, it will throw an error
    const { workflowStepId, ...updateData } = payload;
    const data = {
      ...updateData,
      updatedAt: new Date(),
    };

    return this.workflowStepRepo.prisma.workflowStep.update({
      where: {
        id: payload.workflowStepId,
      },
      data,
    });
  }

  updateAssistant(payload: UpdateWorkflowStepAssistantDto) {
    return this.workflowStepRepo.prisma.workflowStep.update({
      where: {
        id: payload.workflowStepId,
      },
      data: {
        assistantId: payload.assistantId,
        updatedAt: new Date(),
      },
    });
  }

  updateOrder(workflowStepId: string, order: number) {
    return this.workflowStepRepo.prisma.workflowStep.update({
      where: {
        id: workflowStepId.toLowerCase(),
      },
      data: {
        orderColumn: order,
        updatedAt: new Date(),
      },
    });
  }

  updateInputSteps(workflowStepId: string, inputStepIds: string[]) {
    return this.workflowStepRepo.prisma.workflowStep.update({
      where: {
        id: workflowStepId.toLowerCase(),
      },
      data: {
        inputSteps: {
          set: inputStepIds.map((id) => id.toLowerCase()),
        },
        updatedAt: new Date(),
      },
    });
  }

  delete(workflowStepId: string) {
    return this.workflowStepRepo.prisma.workflowStep.delete({
      where: {
        id: workflowStepId.toLowerCase(),
      },
    });
  }

  deleteAllSteps(workflowId: string) {
    return this.workflowStepRepo.prisma.workflowStep.deleteMany({
      where: {
        workflowId: workflowId.toLowerCase(),
      },
    });
  }

  softDelete(workflowStepId: string) {
    return this.workflowStepRepo.prisma.workflowStep.update({
      where: {
        id: workflowStepId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
