import { createZodDto } from 'nestjs-zod';
import { socialLoginSchema } from './social-login.schema';

export class SocialLoginBody extends createZodDto(socialLoginSchema) {}
