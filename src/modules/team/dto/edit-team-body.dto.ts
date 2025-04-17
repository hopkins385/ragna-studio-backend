import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const editTeamBodySchema = z.object({
  name: z.string().trim().min(3, { message: 'Name is required' }),
});

export class EditTeamBody extends createZodDto(editTeamBodySchema) {}
