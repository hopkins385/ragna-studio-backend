import { createZodDto } from 'nestjs-zod';
import { executeWorkflowSchema } from '../schemas/execute-workflow.schema';

export class ExecuteWorkflowBody extends createZodDto(executeWorkflowSchema) {}
