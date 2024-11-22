import { createZodDto } from 'nestjs-zod';
import { collectionAbleSchema } from '../schemas/collection-able.schema';

export class CollectionAbleBody extends createZodDto(collectionAbleSchema) {}
