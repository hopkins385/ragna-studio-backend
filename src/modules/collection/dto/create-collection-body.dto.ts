import { createZodDto } from 'nestjs-zod';
import { createCollectionSchema } from '../schemas/create-collection.schema';

export class CreateCollectionBody extends createZodDto(
  createCollectionSchema,
) {}
