import { z } from 'zod';
import { visionContentSchema } from './chat-message-vision-content.schema';
import { ChatMessageType } from '../enums/chat-message.enum';
import { ChatMessageRole } from '../enums/chat-message-role.enum';

export const chatMessageSchema = z.object({
  type: z.nativeEnum(ChatMessageType),
  role: z.nativeEnum(ChatMessageRole),
  content: z.array(
    z.object({
      type: z.nativeEnum(ChatMessageType),
      text: z.string(),
    }),
  ),

  visionContent: visionContentSchema.nullable().optional(),
});
