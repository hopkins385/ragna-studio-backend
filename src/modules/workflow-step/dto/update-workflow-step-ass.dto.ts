import { createZodDto } from 'nestjs-zod';
import { updateWorkflowStepAssistantSchema } from '../schemas/update-workflow-step-assistant-schema';

export class UpdateWorkflowStepAssistantBody extends createZodDto(
  updateWorkflowStepAssistantSchema,
) {}
