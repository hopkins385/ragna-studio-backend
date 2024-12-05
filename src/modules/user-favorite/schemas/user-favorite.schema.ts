import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';
import { UserFavoriteType } from '../enums/user-favorite.enum';

export const userFavoriteSchema = z.object({
  favoriteId: cuidSchema,
  favoriteType: z.nativeEnum(UserFavoriteType),
});

export const userFavoriteTypeSchema = z.object({
  favoriteType: z.nativeEnum(UserFavoriteType),
});
