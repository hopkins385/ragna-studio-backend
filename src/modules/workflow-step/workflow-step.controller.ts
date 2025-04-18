import { BaseController } from '@/common/controllers/base.controller';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { CreateWorkflowItemDto } from './dto/create-workflow-item.dto';
import { CreateWorkflowRowBody } from './dto/create-workflow-row-body.dts';
import { CreateWorkflowStepBody } from './dto/create-workflow-step-body.dto';
import { CreateWorkflowStepDto } from './dto/create-workflow-step.dto';
import { UpdateWorkflowItemBody } from './dto/update-workflow-item-body.dto';
import { UpdateWorkflowItemParams } from './dto/update-workflow-item-params.dto';
import { UpdateWorkflowItemDto } from './dto/update-workflow-item.dto';
import { UpdateWorkflowStepAssistantBody } from './dto/update-workflow-step-ass.dto';
import { UpdateWorkflowStepBody } from './dto/update-workflow-step-body.dto';
import { UpdateWorkflowStepIdsBody } from './dto/update-workflow-step-ids-body.dto';
import {
  UpdateWorkflowStepAssistantDto,
  UpdateWorkflowStepDto,
} from './dto/update-workflow-step.dto';
import { WorkflowStepService } from './workflow-step.service';

@Controller('workflow-step')
export class WorkflowStepController extends BaseController {
  constructor(private readonly workflowStepService: WorkflowStepService) {
    super();
  }

  @Post()
  async createStep(@ReqUser() reqUser: RequestUser, @Body() body: CreateWorkflowStepBody) {
    try {
      const step = await this.workflowStepService.create(
        CreateWorkflowStepDto.fromInput({
          workflowId: body.workflowId,
          teamId: reqUser.activeTeamId,
          name: body.name,
          description: body.description,
          orderColumn: body.orderColumn,
          rowCount: body.rowCount,
          assistantId: body.assistantId,
        }),
      );
      return { step };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Post('row')
  async createRow(@Body() body: CreateWorkflowRowBody) {
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

    try {
      const row = await this.workflowStepService.createRow(body.workflowId, workflowItemsDtos);
      return { row };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Patch(':id')
  async update(@Param() param: IdParam, @Body() body: UpdateWorkflowStepBody) {
    const payload = UpdateWorkflowStepDto.fromInput({
      workflowStepId: param.id,
      name: body.name,
      description: body.description,
      orderColumn: body.orderColumn,
    });

    try {
      const step = await this.workflowStepService.update(payload);
      return { step };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Patch(':id/assistant')
  async updateAssistant(@Param() param: IdParam, @Body() body: UpdateWorkflowStepAssistantBody) {
    const updatePayload = UpdateWorkflowStepAssistantDto.fromInput({
      workflowStepId: param.id,
      assistantId: body.assistantId,
    });

    try {
      const step = await this.workflowStepService.updateAssistant(updatePayload);
      return { step };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Patch(':id/input-steps')
  async updateInputSteps(@Param() param: IdParam, @Body() body: UpdateWorkflowStepIdsBody) {
    try {
      const steps = await this.workflowStepService.updateInputSteps(param.id, body.inputStepIds);
      return { steps };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Patch(':stepId/item/:itemId')
  async updateItem(
    @Param() params: UpdateWorkflowItemParams,
    @Body() body: UpdateWorkflowItemBody,
  ) {
    try {
      const step = await this.workflowStepService.updateItem(
        UpdateWorkflowItemDto.fromInput({
          workflowStepId: params.stepId,
          itemId: params.itemId,
          itemContent: body.itemContent,
        }),
      );
      return { step };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  async remove(@Param() param: IdParam) {
    const workflowStepId = param.id;
    try {
      const step = await this.workflowStepService.delete(workflowStepId);
      return { step };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
