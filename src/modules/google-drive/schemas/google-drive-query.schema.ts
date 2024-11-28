import { z } from 'zod';

export const googleDriveQuerySchema = z.object({
  searchFileName: z.string().trim().optional(),
  searchFolderId: z.string().trim().optional(),
  pageToken: z.string().trim().optional(),
});
