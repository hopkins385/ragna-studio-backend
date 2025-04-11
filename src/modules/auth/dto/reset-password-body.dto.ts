import { isValidJWT } from '@/common/utils/token-validation';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const resetPasswordBodySchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  token: z
    .string()
    .min(1, { message: 'Token is required' })
    .refine((val) => isValidJWT(val), {
      message: 'Invalid token',
    }),
});

export class ResetPasswordBody extends createZodDto(resetPasswordBodySchema) {}
