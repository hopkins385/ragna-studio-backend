import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import { chatMessageSchema } from '@/modules/chat-message/schemas/chat-message.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createChatStreamSchema = z.object({
  messages: z.array(chatMessageSchema),
  model: z.string(),
  provider: z.nativeEnum(ProviderType),
  maxTokens: z.number().int().min(1).max(4000),
  temperature: z.number().int().min(0).max(100),
});

export class CreateChatStreamBody extends createZodDto(
  createChatStreamSchema,
) {}
