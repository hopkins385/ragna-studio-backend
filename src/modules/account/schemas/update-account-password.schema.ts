import { z } from 'zod';

export const updateAccountPasswordSchema = z.object({
  oldPassword: z.string().min(6).max(100),
  newPassword: z.string().min(6).max(100),
});
