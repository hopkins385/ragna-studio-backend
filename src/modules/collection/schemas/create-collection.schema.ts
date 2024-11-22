import { z } from 'zod';

export const createCollectionSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional().or(z.string().min(3).max(255)),
});
