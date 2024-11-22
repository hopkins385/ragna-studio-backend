import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const updateCollectionSchema = z.object({
  id: cuidSchema,
  name: z.string().min(3).max(255),
  description: z.string().optional().or(z.string().min(3).max(255)),
});
