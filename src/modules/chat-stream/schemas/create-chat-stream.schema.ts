import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import { chatMessageSchema } from '@/modules/chat-message/schemas/chat-message.schema';
import { z } from 'zod';

export const createChatStreamSchema = z.object({
  messages: z.array(chatMessageSchema),
  model: z.string(),
  provider: z.nativeEnum(ProviderType),
  maxTokens: z.number().positive().int(),
  temperature: z.number().positive().int().min(0).max(100),
});
