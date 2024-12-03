import { createZodDto } from 'nestjs-zod';
import { updateAccountNameShema } from '../schemas/update-account-name.schema';

export class UpdateAccountNameBody extends createZodDto(
  updateAccountNameShema,
) {}
