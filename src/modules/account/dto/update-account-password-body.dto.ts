import { createZodDto } from 'nestjs-zod';
import { updateAccountPasswordSchema } from '../schemas/update-account-password.schema';

export class UpdateAccountPasswordBody extends createZodDto(
  updateAccountPasswordSchema,
) {}
