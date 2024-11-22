import { createZodDto } from 'nestjs-zod';
import { createChatStreamSchema } from '../schemas/create-chat-stream.schema';

export class CreateChatStreamBody extends createZodDto(
  createChatStreamSchema,
) {}
