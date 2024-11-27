import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const updateWorkflowStepIdsSchema = z.object({
  inputStepIds: z.array(cuidSchema),
});
