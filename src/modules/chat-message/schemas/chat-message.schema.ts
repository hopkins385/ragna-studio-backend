import { z } from 'zod';
import { visionContentSchema } from './chat-message-vision-content.schema';
import { ChatMessageType } from '../enums/chat-message.enum';
import { ChatMessageRole } from '../enums/chat-message-role.enum';

const chatMessageTextSchema = z.object({
  type: z.nativeEnum(ChatMessageType),
  text: z.string(),
});

const toolCallSchema = z.object({
  type: z.literal('tool-call'),
  toolCallId: z.string(),
  toolName: z.string(),
  args: z.any(),
});

const toolResultSchema = z.object({
  type: z.literal('tool-result'),
  toolCallId: z.string(),
  toolName: z.string(),
  args: z.any(),
  result: z.any(),
});

export const chatMessageSchema = z.object({
  type: z.nativeEnum(ChatMessageType),
  role: z.nativeEnum(ChatMessageRole),
  content: z.array(
    z.union([chatMessageTextSchema, toolCallSchema.optional(), toolResultSchema.optional()]),
  ),
  visionContent: visionContentSchema.nullable().optional(),
});

export type ChatMessageSchema = z.infer<typeof chatMessageSchema>;
