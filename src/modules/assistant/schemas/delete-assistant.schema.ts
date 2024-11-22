import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const deleteAssistantSchema = z.object({
  teamId: cuidSchema,
});
