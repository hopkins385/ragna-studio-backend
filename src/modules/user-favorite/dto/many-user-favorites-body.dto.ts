import { createZodDto } from 'nestjs-zod';
import { manyUserFavoritesSchema } from '../schemas/many-user-favorites.schema';

export class ManyUserFavoritesBody extends createZodDto(
  manyUserFavoritesSchema,
) {}
