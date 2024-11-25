import { createZodDto } from 'nestjs-zod';
import { updateWorkflowItemSchema } from '../schemas/update-workflow-item.schema';

export class UpdateWorkflowItemBody extends createZodDto(
  updateWorkflowItemSchema,
) {}
