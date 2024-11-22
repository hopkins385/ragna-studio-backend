import { createZodDto } from 'nestjs-zod';
import { createWorkflowStepSchema } from '../schemas/create-workflow-step.schema';

export class CreateWorkflowStepBody extends createZodDto(
  createWorkflowStepSchema,
) {}
