import { createZodDto } from 'nestjs-zod';
import { textToImagePaginatedQuerySchema } from '../schemas/query.schema';

export class TextToImagePaginatedQuery extends createZodDto(
  textToImagePaginatedQuerySchema,
) {}
