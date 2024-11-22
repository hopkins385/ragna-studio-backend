import { createZodDto } from 'nestjs-zod';
import { detachCollectionAbleSchema } from '../schemas/detach-collection-able.schema';

export class DetachCollectionAbleBody extends createZodDto(
  detachCollectionAbleSchema,
) {}
