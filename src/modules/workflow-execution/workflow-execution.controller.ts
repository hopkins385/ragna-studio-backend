import { BaseController } from '@/common/controllers/base.controller';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
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
    const { id: workflowId } = param;

    try {
      const jobNodes = await this.workflowExecutionService.executeWorkflow(
        reqUser.id,
        workflowId.toLowerCase(),
      );
      return { success: true };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
