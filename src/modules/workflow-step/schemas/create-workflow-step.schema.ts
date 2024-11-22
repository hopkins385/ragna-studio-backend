import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const createWorkflowStepSchema = z.object({
  assistantId: cuidSchema.optional(),
  workflowId: cuidSchema,
  name: z.string(),
  description: z.string(),
  orderColumn: z.number(),
  rowCount: z.number(),
});
