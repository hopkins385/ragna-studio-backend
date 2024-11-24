import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const executeWorkflowSchema = z.object({
  workflowId: cuidSchema,
});
