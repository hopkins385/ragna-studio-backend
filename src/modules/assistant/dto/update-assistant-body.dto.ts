import { cuidSchema } from '@/common/schemas/cuid.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateAssistantSchema = z.object({
  llmId: cuidSchema,
  title: z.string().max(255),
  description: z.string().max(255).default('').optional(),
  systemPrompt: z.string().max(10000),
  isShared: z.boolean().optional(),
  hasKnowledgeBase: z.boolean().optional(),
  hasWorkflow: z.boolean().optional(),
  tools: z.array(cuidSchema),
});

export class UpdateAssistantBody extends createZodDto(updateAssistantSchema) {}
