import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const googleDriveQuerySchema = z.object({
  fileName: z.string().trim().optional(),
  folderId: z.string().trim().optional(),
  pageToken: z.string().trim().optional(),
});

export class GoogleDriveSearchQuery extends createZodDto(googleDriveQuerySchema) {}
