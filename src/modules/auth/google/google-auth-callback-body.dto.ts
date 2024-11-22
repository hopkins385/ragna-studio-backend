import { createZodDto } from 'nestjs-zod';
import { googleAuthCallbackSchema } from './google-auth-callback.schema';

export class GoogleAuthCallbackBody extends createZodDto(
  googleAuthCallbackSchema,
) {}
