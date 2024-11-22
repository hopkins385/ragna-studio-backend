import { collectionAbleModelSchema } from '@/modules/collection-able/schemas/collectiob-able-model.schema';
import { z } from 'zod';

export const findCollectionForSchema = z.object({
  model: collectionAbleModelSchema,
});
