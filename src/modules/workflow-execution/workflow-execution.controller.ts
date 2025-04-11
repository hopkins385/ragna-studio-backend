import { IdParam } from '@/common/dto/cuid-param.dto';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Controller, InternalServerErrorException, Logger, Param, Post } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { WorkflowExecutionService } from './workflow-execution.service';

@Controller('workflow')
export class WorkflowExecutionController {
  private readonly logger = new Logger(WorkflowExecutionController.name);

  constructor(private readonly workflowExecutionService: WorkflowExecutionService) {}

  @Post(':id/execute')
  async createWorkflowExec(@ReqUser() reqUser: RequestUser, @Param() param: IdParam) {
    const { id: workflowId } = param;

    try {
      const jobNodes = await this.workflowExecutionService.executeWorkflow(
        reqUser.id,
        workflowId.toLowerCase(),
      );
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Error executing workflow: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException('Error executing workflow');
    }
  }
}
