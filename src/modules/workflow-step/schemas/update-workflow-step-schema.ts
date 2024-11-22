import { z } from 'zod';

export const updateWorkflowStepSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  orderColumn: z.number().optional(),
});
