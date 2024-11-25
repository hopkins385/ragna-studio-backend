import { createZodDto } from 'nestjs-zod';
import { updateWorkflowSchema } from '../schemas/update-workflow-body.schema';

export class UpdateWorkflowBody extends createZodDto(updateWorkflowSchema) {}
