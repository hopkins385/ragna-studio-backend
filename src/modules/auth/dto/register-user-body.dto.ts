import { isValidJWT } from '@/common/utils/token-validation';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  termsAndConditions: z.boolean(),
  invitationCode: z
    .string()
    .trim()
    .min(1)
    .refine((value) => isValidJWT(value), 'auth.error.code_invalid'),
});

export class RegisterUserBody extends createZodDto(registerUserSchema) {}
