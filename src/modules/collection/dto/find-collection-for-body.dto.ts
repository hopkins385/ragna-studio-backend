import { createZodDto } from 'nestjs-zod';
import { findCollectionForSchema } from '../schemas/find-collection-for.schema';

export class FindCollectionForBody extends createZodDto(
  findCollectionForSchema,
) {}
