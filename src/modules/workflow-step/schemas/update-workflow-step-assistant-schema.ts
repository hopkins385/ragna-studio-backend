import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const updateWorkflowStepAssistantSchema = z.object({
  assistantId: cuidSchema,
});
