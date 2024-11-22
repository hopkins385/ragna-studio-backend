import { z } from 'zod';

export const googleAuthCallbackSchema = z.object({
  code: z.string(),
  scope: z.string().optional(),
  authuser: z.string().optional(),
  prompt: z.string().optional(),
  error: z.string().optional(),
});
