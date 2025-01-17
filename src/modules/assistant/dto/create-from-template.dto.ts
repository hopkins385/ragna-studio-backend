import { cuidSchema } from '@/common/schemas/cuid.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const SUPPORTED_LANGUAGES = ['de', 'en'] as const;

const createfromTemplateSchema = z.object({
  templateId: cuidSchema,
  language: z.enum(SUPPORTED_LANGUAGES),
});

export class CreateAssistantFromTemplateBody extends createZodDto(
  createfromTemplateSchema,
) {}
