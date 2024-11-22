import { z } from 'zod';

export const createWorkflowSchema = z.object({
  name: z.string(),
  description: z.string(),
});
