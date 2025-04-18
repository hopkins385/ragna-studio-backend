import { BaseController } from '@/common/controllers/base.controller';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ReqUser } from '../user/decorators/user.decorator';
import { CreateWorkflowBody } from './dto/create-workflow-body.dto';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { FindAllWorkflowsDto } from './dto/find-all-workflows.dto';
import { UpdateWorkflowBody } from './dto/update-workflow-body.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowService } from './workflow.service';

@Controller('workflow')
export class WorkflowController extends BaseController {
  constructor(private readonly workflowService: WorkflowService) {
    super();
  }

  @Post()
  async create(@ReqUser() reqUser: RequestUser, @Body() body: CreateWorkflowBody) {
    try {
      const workflow = await this.workflowService.create(
        CreateWorkflowDto.fromInput({
          teamId: reqUser.activeTeamId,
          name: body.name,
          description: body.description,
        }),
      );
      return { workflow };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get()
  async allPaginated(@ReqUser() reqUser: RequestUser, @Query() query: PaginateQuery) {
    try {
      const [workflows, meta] = await this.workflowService.findAllPaginated(
        FindAllWorkflowsDto.fromInput({
          teamId: reqUser.activeTeamId,
          page: query.page,
          limit: query.limit,
        }),
      );

      return { workflows, meta };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get(':id')
  async findOne(@Param() param: IdParam) {
    try {
      const workflow = await this.workflowService.findFirst(param.id);
      return { workflow };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get(':id/full')
  async findFull(@Param() param: IdParam) {
    try {
      const workflow = await this.workflowService.findFirstWithSteps(param.id);
      return { workflow };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':id')
  async update(@Param() param: IdParam, @Body() body: UpdateWorkflowBody) {
    try {
      const workflow = await this.workflowService.update(
        UpdateWorkflowDto.fromInput({
          workflowId: param.id,
          name: body.name,
          description: body.description,
        }),
      );
      return { workflow };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id/export')
  async exportWorkflow(@Param() param: IdParam, @Res({ passthrough: true }) res: Response) {
    try {
      const buffer = await this.workflowService.export(param.id, 'xlsx');
      const file = new StreamableFile(buffer);
      return file;
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  async remove(@Param() param: IdParam) {
    const workflowId = param.id;
    try {
      await this.workflowService.delete({ workflowId });
      return { success: true };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Patch(':id/row')
  async removeRows(@Param() param: IdParam, @Body() body: { orderColumns: number[] }) {
    const workflowId = param.id;
    const orderColumns = body.orderColumns;

    try {
      await this.workflowService.deleteRows({ workflowId, orderColumns });
      return { success: true };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
