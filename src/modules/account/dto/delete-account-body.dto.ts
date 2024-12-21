import { createZodDto } from 'nestjs-zod';
import { deleteAccountSchema } from '../schemas/delete-account.schema';

export class DeleteAccountBody extends createZodDto(deleteAccountSchema) {}
