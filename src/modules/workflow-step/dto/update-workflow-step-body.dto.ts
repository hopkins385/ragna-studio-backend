import { createZodDto } from 'nestjs-zod';
import { updateWorkflowStepSchema } from '../schemas/update-workflow-step-schema';

export class UpdateWorkflowStepBody extends createZodDto(
  updateWorkflowStepSchema,
) {}
