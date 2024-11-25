import { z } from 'zod';

export const updateWorkflowSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().min(3).max(255).optional(),
});
