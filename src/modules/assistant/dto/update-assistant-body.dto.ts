import { cuidSchema } from '@/common/schemas/cuid.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateAssistantSchema = z.object({
  llmId: cuidSchema,
  title: z.string(),
  description: z.string(),
  systemPrompt: z.string(),
  isShared: z.boolean().optional(),
  hasKnowledgeBase: z.boolean().optional(),
  hasWorkflow: z.boolean().optional(),
  tools: z.array(cuidSchema),
});

export class UpdateAssistantBody extends createZodDto(updateAssistantSchema) {}
