import { createZodDto } from 'nestjs-zod';
import { createChatSchema } from '../schemas/create-chat.schema';

export class CreateChatBody extends createZodDto(createChatSchema) {}
