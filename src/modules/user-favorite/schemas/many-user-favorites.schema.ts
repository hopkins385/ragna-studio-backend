import { z } from 'zod';
import { userFavoriteSchema } from './user-favorite.schema';

export const manyUserFavoritesSchema = z.object({
  favorites: z.array(userFavoriteSchema),
});
