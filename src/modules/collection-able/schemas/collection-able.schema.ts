import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';
import { collectionAbleModelSchema } from './collectiob-able-model.schema';

export const collectionAbleSchema = z.object({
  model: collectionAbleModelSchema,
  collectionId: cuidSchema,
});
