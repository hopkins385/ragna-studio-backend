import { createZodDto } from 'nestjs-zod';
import { userFavoriteTypeSchema } from '../schemas/user-favorite.schema';

export class FavoriteTypeParam extends createZodDto(userFavoriteTypeSchema) {}
export class FavoriteTypeBody extends createZodDto(userFavoriteTypeSchema) {}
