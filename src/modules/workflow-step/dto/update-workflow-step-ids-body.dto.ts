import { createZodDto } from 'nestjs-zod';
import { updateWorkflowStepIdsSchema } from '../schemas/update-workflow-step-ids-schema';

export class UpdateWorkflowStepIdsBody extends createZodDto(
  updateWorkflowStepIdsSchema,
) {}
