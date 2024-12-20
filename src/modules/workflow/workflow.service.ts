import { Injectable, Logger } from '@nestjs/common';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowRepository } from './repositories/workflow.repository';
import xlsx from 'node-xlsx';
import { MediaAbleDto } from '../media-able/dto/media-able.dto';
import { FindAllWorkflowsDto } from './dto/find-all-workflows.dto';
import { MediaAbleService } from '../media-able/media-able.service';
import { FileParserFactory } from '../media/utils/fileParserFactory';
import { MediaAblesResponseDto } from '../media-able/dto/media-able-response.dto';
import { CreateWorkflowStepDto } from '../workflow-step/dto/create-workflow-step.dto';
import { WorkflowStepService } from '../workflow-step/workflow-step.service';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private readonly workflowRepo: WorkflowRepository,
    private readonly workflowStepService: WorkflowStepService,
    private readonly mediaAbleService: MediaAbleService,
  ) {}

  async create(payload: CreateWorkflowDto) {
    const assistant = await this.workflowRepo.prisma.assistant.findFirst({
      where: {
        teamId: payload.teamId,
        deletedAt: null,
      },
    });
    if (!assistant) {
      throw new Error('Team has no assistants');
    }
    const workflow = await this.workflowRepo.prisma.workflow.create({
      data: {
        teamId: payload.teamId,
        name: payload.name,
        description: payload.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // create the first step for the workflow
    const stepPayload = CreateWorkflowStepDto.fromInput({
      workflowId: workflow.id,
      assistantId: assistant.id,
      teamId: payload.teamId,
      name: 'Input',
      description: 'Input for the Workflow',
      orderColumn: 0,
      rowCount: 1,
    });
    const workflowStep = await this.workflowStepService.create(stepPayload);
    return workflow;
  }

  async reCreateFromMedia(payload: { workflowId: string; mediaId: string }) {
    const workflow = await this.workflowRepo.prisma.workflow.findFirst({
      where: {
        id: payload.workflowId.toLowerCase(),
        deletedAt: null,
      },
      select: {
        id: true,
        teamId: true,
      },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const media = await this.workflowRepo.prisma.media.findFirst({
      where: {
        id: payload.mediaId.toLowerCase(),
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        filePath: true,
        fileMime: true,
      },
    });

    if (!media) {
      throw new Error('Media not found');
    }

    // get the first assistant of the team
    const assistant = await this.workflowRepo.prisma.assistant.findFirst({
      where: {
        teamId: workflow.teamId,
        deletedAt: null,
      },
    });

    if (!assistant) {
      throw new Error('Team has no assistants');
    }

    let firstSheet: any;

    // read file
    const fileParser = new FileParserFactory(media.fileMime, media.filePath);
    const fileData = await fileParser.loadData();
    if (media.fileMime.includes('spreadsheet')) {
      firstSheet = fileData?.[0];
    } else {
      firstSheet = fileData;
    }

    if (!firstSheet) {
      throw new Error('No data found in the file');
    }

    let newStepsCount = firstSheet.data?.[0].length;

    if (!newStepsCount || newStepsCount < 1) {
      throw new Error('No columns found in the file');
    }

    const newStepsCountLimit = 5;
    if (newStepsCount > newStepsCountLimit) {
      this.logger.warn(`The file has more than ${newStepsCountLimit} columns`);
      newStepsCount = newStepsCountLimit;
    }

    // transform the data into steps
    // the data in the table look like this
    // [ [ 'Step 1', 'Step 2', 'Step 3' ], [ 'Step_1_row_1', 'Step_1_row_2', 'Step_1_row_3' ], [ 'Step_2_row_1', 'Step_2_row_2', 'Step_2_row_3' ] ]
    // but we need to transpose it to look like this
    // [ [ 'Step 1', 'Step 2', 'Step 3' ], [ 'Step_1_row_1', 'Step_2_row_1', 'Step_3_row_1' ], [ 'Step_1_row_2', 'Step_2_row_2', 'Step_3_row_2' ] ]
    const newData = [] as any;
    firstSheet.data.slice(1).forEach((row: any[], rowIndex: number) => {
      row.forEach((cell: any, cellIndex: number) => {
        if (!newData[cellIndex]) {
          newData[cellIndex] = [];
        }
        newData[cellIndex].push(cell);
      });
    });

    let newRowsCount = newData?.[0].length;

    const newRowsCountLimit = 20;
    if (newRowsCount > newRowsCountLimit) {
      this.logger.warn(`The file has more than ${newRowsCountLimit} rows`);
      newRowsCount = newRowsCountLimit;
    }

    const manyStepsPayload = [] as CreateWorkflowStepDto[];
    for (let i = 0; i < newStepsCount; i++) {
      const stepPayload = CreateWorkflowStepDto.fromInput({
        workflowId: workflow.id,
        teamId: workflow.teamId,
        assistantId: assistant.id,
        name: firstSheet.data[0][i],
        description: '',
        orderColumn: i,
        rowCount: newRowsCount,
        rowContents: newData[i],
      });
      manyStepsPayload.push(stepPayload);
    }

    // delete all the steps for the workflow including the document and document items
    await this.workflowStepService.deleteAllSteps(workflow.id);

    const workflowSteps =
      await this.workflowStepService.createMany(manyStepsPayload);
    return workflow;
  }

  async findFirst(workflowId: string) {
    if (!workflowId || workflowId === '' || typeof workflowId !== 'string') {
      throw new Error('Workflow ID is required');
    }
    const workflow = await this.workflowRepo.prisma.workflow.findFirst({
      relationLoadStrategy: 'join',
      select: {
        id: true,
        name: true,
        description: true,
        teamId: true,
      },
      where: {
        id: workflowId.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!workflow) {
      return null;
    }

    // find the mediaAbles for the workflow
    const mediaAbleModel = MediaAbleDto.fromInput({
      id: workflow.id,
      type: 'workflow',
    });

    const mediaAblesResult =
      await this.mediaAbleService.getMediaAbles(mediaAbleModel);
    const mediaAbles = MediaAblesResponseDto.fromMediaAbles(mediaAblesResult);

    return {
      ...workflow,
      ...mediaAbles,
    };
  }

  async findFirstWithSteps(workflowId: string) {
    if (!workflowId || workflowId === '' || typeof workflowId !== 'string') {
      throw new Error('Workflow ID is required');
    }
    const workflow = await this.workflowRepo.prisma.workflow.findFirst({
      relationLoadStrategy: 'join',
      where: {
        id: workflowId.toLowerCase(),
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        teamId: true,
      },
    });

    if (!workflow) {
      return null;
    }

    const workflowSteps = await this.workflowRepo.prisma.workflowStep.findMany({
      relationLoadStrategy: 'join',
      where: {
        workflowId: workflow.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        orderColumn: true,
        inputSteps: true,
        createdAt: true,
        updatedAt: true,
        document: {
          select: {
            id: true,
            name: true,
            description: true,
            documentItems: {
              select: {
                id: true,
                orderColumn: true,
                content: true,
                type: true,
                processingStatus: true,
              },
              where: {
                deletedAt: null,
              },
              orderBy: {
                orderColumn: 'asc',
              },
            },
          },
          where: {
            deletedAt: null,
          },
        },
        assistant: {
          select: {
            id: true,
            title: true,
            description: true,
            systemPrompt: true,
            llm: {
              select: {
                displayName: true,
                provider: true,
                apiName: true,
              },
            },
            tools: {
              select: {
                tool: {
                  select: {
                    id: true,
                    name: true,
                    functionId: true,
                  },
                },
              },
              where: {
                deletedAt: null,
              },
            },
          },
          where: {
            deletedAt: null,
          },
        },
      },
      orderBy: {
        orderColumn: 'asc',
      },
    });

    return {
      ...workflow,
      steps: workflowSteps,
    };
  }

  findAllPaginated(payload: FindAllWorkflowsDto) {
    return this.workflowRepo.prisma.workflow
      .paginate({
        where: {
          teamId: payload.teamId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
      })
      .withPages({
        limit: payload.limit,
        page: payload.page,
        includePageCount: true,
      });
  }

  findAllForUser(userId: string, projectId: string | undefined, page: number) {
    // first lets find all the projects for the user
    throw new Error('Method not implemented.');
  }

  update(payload: UpdateWorkflowDto) {
    return this.workflowRepo.prisma.workflow.update({
      where: {
        id: payload.workflowId.toLowerCase(),
      },
      data: {
        name: payload.name,
        description: payload.description,
        updatedAt: new Date(),
      },
    });
  }

  async deleteRows(payload: { workflowId: string; orderColumns: number[] }) {
    const workflowId = payload.workflowId.toLowerCase();
    const orderColumnsSet = new Set(payload.orderColumns);
    if (!payload.orderColumns || payload.orderColumns.length === 0) {
      throw new Error('No order columns provided');
    }
    // consola.info('Deleting rows', { workflowId, payload.orderColumns });
    // delete all document items of all workflow steps having the orderColumn in the orderColumns array
    const workflow = await this.workflowRepo.prisma.workflow.findFirst({
      where: {
        id: workflowId,
        deletedAt: null,
      },
      select: {
        id: true,
        steps: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            document: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
                documentItems: {
                  where: {
                    deletedAt: null,
                  },
                  select: {
                    id: true,
                    orderColumn: true,
                  },
                  orderBy: {
                    orderColumn: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!workflow || !workflow.steps || workflow.steps.length === 0) {
      throw new Error('Workflow or WorkflowSteps not found');
    }

    const documentItemsToBeDeleted = workflow.steps
      .map((step) => step.document?.documentItems)
      .flat()
      .filter((item) => orderColumnsSet.has(item!.orderColumn));

    if (!documentItemsToBeDeleted || documentItemsToBeDeleted.length === 0) {
      throw new Error('No document items found');
    }

    await this.workflowRepo.prisma.documentItem.deleteMany({
      where: {
        id: {
          in: documentItemsToBeDeleted.map((item) => item!.id),
        },
      },
    });

    // reset the orderColumn of the document items foreach of the workflow step
    // so just to make sure that the orderColumn is in sequence
    const updatePromises = workflow.steps.map((step) => {
      // documentItems that are not deleted
      const documentItems = step.document?.documentItems.filter(
        (item) => !orderColumnsSet.has(item.orderColumn),
      );

      const itemUpdatePromises = documentItems?.map((item, index) => {
        return this.workflowRepo.prisma.documentItem.update({
          where: {
            id: item.id,
          },
          data: {
            orderColumn: index,
          },
        });
      });

      return Promise.all(itemUpdatePromises || []);
    });

    await Promise.all(updatePromises);

    return true;
  }

  async clearAllRows(payload: { workflowId: string }) {
    // delete/clear all document items content of all workflow steps except the first step
    const workflow = await this.workflowRepo.prisma.workflow.findFirst({
      where: {
        id: payload.workflowId.toLowerCase(),
        deletedAt: null,
      },
      select: {
        id: true,
        steps: {
          where: {
            deletedAt: null,
            orderColumn: {
              not: 0,
            },
          },
          select: {
            id: true,
            document: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
                documentItems: {
                  where: {
                    deletedAt: null,
                  },
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const documentItemsToBeCleared = workflow.steps
      .map((step) => step.document?.documentItems)
      .flat();

    if (!documentItemsToBeCleared || documentItemsToBeCleared.length === 0) {
      throw new Error('No document items found');
    }

    await this.workflowRepo.prisma.documentItem.updateMany({
      data: {
        content: '',
      },
      where: {
        id: {
          in: documentItemsToBeCleared.map((item) => item!.id),
        },
      },
    });

    return true;
  }

  async delete(workflowId: string) {
    return this.workflowRepo.prisma.workflow.delete({
      where: {
        id: workflowId.toLowerCase(),
      },
    });
  }

  async softDelete(workflowId: string) {
    return this.workflowRepo.prisma.workflow.update({
      where: {
        id: workflowId.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async export(
    workflowId: string,
    type: 'xlsx', // 'json' | 'xml' | 'csv' | 'xlsx' | 'pdf',
  ) {
    const workflow = await this.workflowRepo.prisma.workflow.findFirst({
      relationLoadStrategy: 'join',
      where: {
        id: workflowId.toLowerCase(),
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        steps: {
          select: {
            id: true,
            name: true,
            description: true,
            orderColumn: true,
            createdAt: true,
            updatedAt: true,
            document: {
              select: {
                id: true,
                name: true,
                description: true,
                documentItems: {
                  select: {
                    id: true,
                    orderColumn: true,
                    content: true,
                    type: true,
                  },
                  where: {
                    deletedAt: null,
                  },
                  orderBy: {
                    orderColumn: 'asc',
                  },
                },
              },
              where: {
                deletedAt: null,
              },
            },
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
      throw new Error('Workflow not found');
    }
    const { steps } = workflow;
    const headlines = steps.map((step) => step.name);

    const rows = [] as any;
    // the data in the table look like this
    // [ [ 'Step 1', 'Step 2', 'Step 3' ], [ 'Step_1_row_1', 'Step_1_row_2', 'Step_1_row_3' ], [ 'Step_2_row_1', 'Step_2_row_2', 'Step_2_row_3' ] ]
    // but we need to transpose it to look like this
    // [ [ 'Step 1', 'Step 2', 'Step 3' ], [ 'Step_1_row_1', 'Step_2_row_1', 'Step_3_row_1' ], [ 'Step_1_row_2', 'Step_2_row_2', 'Step_3_row_2' ] ]
    steps.forEach((step) => {
      step.document?.documentItems.forEach((item, index) => {
        if (!rows[index]) {
          rows[index] = [];
        }
        rows[index].push(item.content);
      });
    });

    return xlsx.build([
      {
        name: workflow.name,
        data: [headlines, ...rows],
        options: {},
      },
    ]);
  }
}
