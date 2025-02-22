import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { userFavoriteSchema } from '../schemas/user-favorite.schema';

export const manyUserFavoritesSchema = z.object({
  favorites: z.array(userFavoriteSchema),
});

export class ManyUserFavoritesBody extends createZodDto(
  manyUserFavoritesSchema,
) {}
