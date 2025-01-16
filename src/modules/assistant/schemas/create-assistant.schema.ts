import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const createAssistantSchema = z.object({
  teamId: cuidSchema,
  llmId: cuidSchema,
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(255),
  systemPrompt: z.string().min(1),
  isShared: z.boolean().default(false).optional(),
  tools: z.array(cuidSchema),
});
