import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const updateWorkflowItemParamsSchema = z.object({
  stepId: cuidSchema,
  itemId: cuidSchema,
});

export const updateWorkflowItemSchema = z.object({
  itemContent: z.string(),
});
