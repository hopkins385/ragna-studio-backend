import { createZodDto } from 'nestjs-zod';
import { updateWorkflowItemParamsSchema } from '../schemas/update-workflow-item.schema';

export class UpdateWorkflowItemParams extends createZodDto(
  updateWorkflowItemParamsSchema,
) {}
