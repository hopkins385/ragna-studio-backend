import { createUserBodySchema } from '@/modules/user/dto/create-user-body.dto';
import { createZodDto } from 'nestjs-zod';

export const inviteUserBodySchema = createUserBodySchema.omit({
  password: true,
});

export class InviteUserBody extends createZodDto(inviteUserBodySchema) {}
