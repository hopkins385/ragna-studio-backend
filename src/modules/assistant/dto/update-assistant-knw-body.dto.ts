import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateAssistantHasKnowledge = z.object({
  hasKnowledgeBase: z.boolean(),
});

export class UpdateAssistantHasKnowledgeBody extends createZodDto(
  updateAssistantHasKnowledge,
) {}
