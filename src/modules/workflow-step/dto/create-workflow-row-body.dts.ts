import { createZodDto } from 'nestjs-zod';
import { createWorkflowRowSchema } from '../schemas/create-workflow-row.schema';

export class CreateWorkflowRowBody extends createZodDto(
  createWorkflowRowSchema,
) {}
