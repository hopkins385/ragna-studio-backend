// src/types/prisma.types.ts
import type {
  AssistantTemplateConfig,
  AssistantTemplatePrompt,
} from '@/modules/assistant-template/entities/assistant-template.entity';

declare global {
  namespace PrismaJson {
    type TemplateSystemPromptType = AssistantTemplatePrompt;
    type TemplateConfigType = AssistantTemplateConfig;
  }
}

export {};
