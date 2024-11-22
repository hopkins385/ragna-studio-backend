import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

const workflowRowItemSchema = z.object({
  documentId: cuidSchema,
  orderColumn: z.number(),
  content: z.string(),
  status: z.string(),
  type: z.string(),
});

export const createWorkflowRowSchema = z.object({
  workflowId: cuidSchema,
  items: z.array(workflowRowItemSchema),
});
