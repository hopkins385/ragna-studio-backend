import { createZodDto } from 'nestjs-zod';
import { userFavoriteSchema } from '../schemas/user-favorite.schema';

export class AddUserFavoriteBody extends createZodDto(userFavoriteSchema) {}
