import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WorkflowStepService } from './workflow-step.service';
import { CreateWorkflowStepDto } from './dto/create-workflow-step.dto';
import { UpdateWorkflowStepDto } from './dto/update-workflow-step.dto';
import { CreateWorkflowStepBody } from './dto/create-workflow-step-body.dto';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { CreateWorkflowRowBody } from './dto/create-workflow-row-body.dts';
import { CreateWorkflowItemDto } from './dto/create-workflow-item.dto';
import { UpdateWorkflowStepBody } from './dto/update-workflow-step-body.dto';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { UpdateWorkflowItemDto } from './dto/update-workflow-item.dto';
import { UpdateWorkflowItemBody } from './dto/update-workflow-item-body.dto';
import { UpdateWorkflowItemParams } from './dto/update-workflow-item-params.dto';

@Controller('workflow-step')
export class WorkflowStepController {
  constructor(private readonly workflowStepService: WorkflowStepService) {}

  @Post()
  async createStep(
    @ReqUser() user: UserEntity,
    @Body() body: CreateWorkflowStepBody,
  ) {
    const payload = CreateWorkflowStepDto.fromInput({
      workflowId: body.workflowId,
      teamId: user.teams[0].team.id,
      name: body.name,
      description: body.description,
      orderColumn: body.orderColumn,
      rowCount: body.rowCount,
      assistantId: body.assistantId,
    });
    const step = await this.workflowStepService.create(payload);
    return { step };
  }

  @Post('row')
  async createRow(
    @ReqUser() user: UserEntity,
    @Body() body: CreateWorkflowRowBody,
  ) {
    const workflowItemsDtos = [];
    // is like adding many steps at once
    for (const item of body.items) {
      const dto = CreateWorkflowItemDto.fromInput({
        documentId: item.documentId,
        content: item.content,
        orderColumn: item.orderColumn,
        type: item.type,
        status: item.status,
      });
      workflowItemsDtos.push(dto);
    }

    const row = await this.workflowStepService.createRow(
      body.workflowId,
      workflowItemsDtos,
    );
  }

  @Patch(':id')
  async update(
    @ReqUser() user: UserEntity,
    @Param() param: IdParam,
    @Body() body: UpdateWorkflowStepBody,
  ) {
    const payload = UpdateWorkflowStepDto.fromInput({
      workflowStepId: param.id,
      name: body.name,
      description: body.description,
      orderColumn: body.orderColumn,
    });

    const step = await this.workflowStepService.update(payload);

    return { step };
  }

  @Patch(':stepId/item/:itemId')
  async updateItem(
    @ReqUser() user: UserEntity,
    @Param() params: UpdateWorkflowItemParams,
    @Body() body: UpdateWorkflowItemBody,
  ) {
    const payload = UpdateWorkflowItemDto.fromInput({
      workflowStepId: params.stepId,
      itemId: params.itemId,
      itemContent: body.itemContent,
    });

    const step = await this.workflowStepService.updateItem(payload);

    return { step };
  }

  @Delete(':id')
  async remove(@Param() param: IdParam) {
    const step = await this.workflowStepService.delete(param.id);
    return { step };
  }
}
