import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Res,
  StreamableFile,
  NotFoundException,
  Delete,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { FindAllWorkflowsDto } from './dto/find-all-workflows.dto';
import { CreateWorkflowBody } from './dto/create-workflow-body.dto';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { UpdateWorkflowBody } from './dto/update-workflow-body.dto';
import { Response } from 'express';

@Controller('workflow')
export class WorkflowController {
  private readonly logger = new Logger(WorkflowController.name);

  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  async create(@ReqUser() user: UserEntity, @Body() body: CreateWorkflowBody) {
    const payload = CreateWorkflowDto.fromInput({
      teamId: user.firstTeamId,
      name: body.name,
      description: body.description,
    });
    const workflow = await this.workflowService.create(payload);
    return { workflow };
  }

  @Get()
  async allPaginated(
    @ReqUser() user: UserEntity,
    @Query() query: PaginateQuery,
  ) {
    const payload = FindAllWorkflowsDto.fromInput({
      teamId: user.firstTeamId,
      page: query.page,
      limit: query.limit,
    });
    const [workflows, meta] =
      await this.workflowService.findAllPaginated(payload);

    return { workflows, meta };
  }

  @Get(':id')
  async findOne(@Param() param: IdParam) {
    const workflow = await this.workflowService.findFirst(param.id);
    return { workflow };
  }

  @Get(':id/full')
  async findFull(@Param() param: IdParam) {
    try {
      const workflow = await this.workflowService.findFirstWithSteps(param.id);
      return { workflow };
    } catch (error) {
      throw new NotFoundException('Workflow not found');
    }
  }

  @Patch(':id')
  async update(@Param() param: IdParam, @Body() body: UpdateWorkflowBody) {
    const payload = UpdateWorkflowDto.fromInput({
      workflowId: param.id,
      name: body.name,
      description: body.description,
    });

    try {
      const workflow = await this.workflowService.update(payload);
      return { workflow };
    } catch (error) {
      throw new NotFoundException('Workflow not found');
    }
  }

  @Get(':id/export')
  async exportWorkflow(
    @Param() param: IdParam,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const buffer = await this.workflowService.export(param.id, 'xlsx');
      const file = new StreamableFile(buffer);
      return file;
    } catch (error) {
      throw new NotFoundException('Workflow not found');
    }
  }

  @Delete(':id')
  async remove(@Param() param: IdParam) {
    const workflowId = param.id;
    try {
      await this.workflowService.delete({ workflowId });
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to delete workflow ${workflowId}, ${error.message}`,
        );
      }
      throw new InternalServerErrorException('Failed to delete workflow');
    }
  }

  @Patch(':id/row')
  async removeRows(
    @Param() param: IdParam,
    @Body() body: { orderColumns: number[] },
  ) {
    const workflowId = param.id;
    const orderColumns = body.orderColumns;

    try {
      await this.workflowService.deleteRows({ workflowId, orderColumns });
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to delete workflow rows ${workflowId}, ${error.message}`,
        );
      }
      throw new InternalServerErrorException('Failed to delete workflow rows');
    }
  }
}
