import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createPromptSchema = z.object({
  input: z.string().trim().min(1, { message: 'Input is required' }),
});

export class CreatePromptBody extends createZodDto(createPromptSchema) {}
