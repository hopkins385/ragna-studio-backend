import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createUserBodySchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Email is required' }),
  password: z.string().min(8, { message: 'Password is required' }),
  roleName: z.enum(['admin', 'user'], {
    errorMap: () => ({ message: 'Role is required' }),
  }),
});

export class CreateUserBody extends createZodDto(createUserBodySchema) {}
