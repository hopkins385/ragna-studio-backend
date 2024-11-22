import { createZodDto } from 'nestjs-zod';
import { updateCollectionSchema } from '../schemas/update-collection.schema';

export class UpdateCollectionBody extends createZodDto(
  updateCollectionSchema,
) {}
