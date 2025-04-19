import { BaseController } from '@/common/controllers/base.controller';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { ExecWorkflowStepParams } from '@/modules/workflow-execution/dto/exec-workflow-step-params.dto';
import { Controller, Param, Post } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { WorkflowExecutionService } from './workflow-execution.service';

@Controller('workflow')
export class WorkflowExecutionController extends BaseController {
  constructor(private readonly workflowExecutionService: WorkflowExecutionService) {
    super();
  }

  @Post(':id/execute')
  async createWorkflowExec(@ReqUser() reqUser: RequestUser, @Param() param: IdParam) {
    try {
      const jobNodes = await this.workflowExecutionService.executeWorkflow({
        userId: reqUser.id,
        workflowId: param.id.toLowerCase(),
      });
      return { success: true };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  // @Post(':id/execute/stop')
  // async stopWorkflowExec(@ReqUser() reqUser: RequestUser, @Param() param: IdParam) {
  //   try {
  //     const jobNodes = await this.workflowExecutionService.stopWorkflow({
  //       userId: reqUser.id,
  //       workflowId: param.id.toLowerCase(),
  //     });
  //     return { success: true };
  //   } catch (error: unknown) {
  //     this.handleError(error);
  //   }
  // }

  // execute single workflow step
  @Post(':id/step/:stepId/execute')
  async createWorkflowStepExec(
    @ReqUser() reqUser: RequestUser,
    @Param() params: ExecWorkflowStepParams,
  ) {
    try {
      const jobNodes = await this.workflowExecutionService.executeWorkflowStep({
        userId: reqUser.id,
        workflowId: params.id.toLowerCase(),
        stepId: params.stepId.toLowerCase(),
      });
      return { success: true };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
