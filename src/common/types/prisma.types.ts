// src/types/prisma.types.ts

import type { AssistantTemplatePrompt } from '@/modules/assistant-template/entities/assistant-template.entity';

declare global {
  namespace PrismaJson {
    type TemplateSystemPromptType = AssistantTemplatePrompt;
  }
}

export {};
