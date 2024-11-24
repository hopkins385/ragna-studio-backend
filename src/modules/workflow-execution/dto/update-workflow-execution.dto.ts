import { PartialType } from '@nestjs/swagger';
import { CreateWorkflowExecutionDto } from './create-workflow-execution.dto';

export class UpdateWorkflowExecutionDto extends PartialType(CreateWorkflowExecutionDto) {}
