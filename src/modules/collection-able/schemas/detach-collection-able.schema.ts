import { z } from 'zod';
import { collectionAbleModelSchema } from './collectiob-able-model.schema';

export const detachCollectionAbleSchema = z.object({
  model: collectionAbleModelSchema,
});
