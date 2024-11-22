import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';
import { CollectionAbleTypeEnum } from '../enum/collection-able.enum';

export const collectionAbleModelSchema = z.object({
  id: cuidSchema,
  type: z
    .nativeEnum(CollectionAbleTypeEnum)
    .transform((val) => val.toString().toLowerCase()),
});
