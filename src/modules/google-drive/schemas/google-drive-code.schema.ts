import { z } from 'zod';

export const googleDriveCodeSchema = z.object({
  code: z.string().trim(),
});
