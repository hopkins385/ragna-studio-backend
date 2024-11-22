import { z } from 'zod';
export const visionContentSchema = z.array(
  z.object({
    type: z.enum(['text', 'image', 'video', 'audio']),
    url: z.string(),
  }),
);
