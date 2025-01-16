import { cuidSchema } from '@/common/schemas/cuid.schema';
import { z } from 'zod';

export const updateAssistantSchema = z.object({
  teamId: cuidSchema,
  llmId: cuidSchema,
  title: z.string(),
  description: z.string(),
  systemPrompt: z.string(),
  isShared: z.boolean().optional(),
  hasKnowledgeBase: z.boolean().optional(),
  hasWorkflow: z.boolean().optional(),
  tools: z.array(cuidSchema),
});
