import { createZodDto } from 'nestjs-zod';
import { createUserBodySchema } from './create-user-body.dto';

// partial type is used to make all properties optional
const updateUserBodySchema = createUserBodySchema.partial();

export class UpdateUserBody extends createZodDto(updateUserBodySchema) {}
