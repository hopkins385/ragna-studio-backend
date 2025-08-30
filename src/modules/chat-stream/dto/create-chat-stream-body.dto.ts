import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import { chatMessageSchema } from '@/modules/chat-message/schemas/chat-message.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createChatStreamSchema = z.object({
  messages: z.array(chatMessageSchema),
  context: z.string().optional(),
  maxTokens: z.number().int().min(1).max(8192).optional().nullable().default(8192),
  temperature: z.number().int().min(0).max(100),
  reasoningEffort: z.number().int().min(0).max(3).optional(),
  model: z.string().optional(),
  provider: z.nativeEnum(ProviderType).optional(),
});

export class CreateChatStreamBody extends createZodDto(createChatStreamSchema) {}
