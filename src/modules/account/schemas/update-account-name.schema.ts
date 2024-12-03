import { z } from 'zod';

export const updateAccountNameShema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
});
