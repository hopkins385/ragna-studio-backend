import { cuidSchema } from '@/common/schemas/cuid.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createAssistantSchema = z.object({
  llmId: cuidSchema,
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(255),
  systemPrompt: z.string().min(1),
  isShared: z.boolean().default(false).optional(),
  tools: z.array(cuidSchema),
});

export class CreateAssistantBody extends createZodDto(createAssistantSchema) {}
