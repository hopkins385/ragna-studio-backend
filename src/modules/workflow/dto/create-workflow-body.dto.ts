import { createZodDto } from 'nestjs-zod';
import { createWorkflowSchema } from '../schemas/create-workflow-body.schema';

export class CreateWorkflowBody extends createZodDto(createWorkflowSchema) {}
