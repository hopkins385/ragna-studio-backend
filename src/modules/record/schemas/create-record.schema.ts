import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const createRecordSchema = z.object({
  collectionId: cuidSchema,
  mediaId: cuidSchema,
});
