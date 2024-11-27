import {
  Controller,
  Post,
  Param,
  InternalServerErrorException,
} from '@nestjs/common';
import { WorkflowExecutionService } from './workflow-execution.service';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { IdParam } from '@/common/dto/cuid-param.dto';

@Controller('workflow')
export class WorkflowExecutionController {
  constructor(
    private readonly workflowExecutionService: WorkflowExecutionService,
  ) {}

  @Post(':id/execute')
  async createWorkflowExec(
    @ReqUser() user: UserEntity,
    @Param() param: IdParam,
  ) {
    const { id: workflowId } = param;

    try {
      const jobNodes = await this.workflowExecutionService.executeWorkflow(
        user.id,
        workflowId.toLowerCase(),
      );
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Error executing workflow');
    }
  }
}
