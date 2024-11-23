import { z } from 'zod';

export const onboardUserSchema = z.object({
  orgName: z.string().trim().min(2).max(255),
});
