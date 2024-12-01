import { createZodDto } from 'nestjs-zod';
import { googleDriveQuerySchema } from '../schemas/google-drive-query.schema';

export class GoogleDriveSearchQuery extends createZodDto(
  googleDriveQuerySchema,
) {}
