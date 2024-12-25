import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  termsAndConditions: z.boolean(),
});

export class RegisterUserBody extends createZodDto(registerUserSchema) {}
