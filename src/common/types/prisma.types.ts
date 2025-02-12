// src/types/prisma.types.ts
import type {
  AssistantTemplateConfig,
  AssistantTemplatePrompt,
} from '@/modules/assistant-template/entities/assistant-template.entity';
import { DeviceInfo } from '@/modules/session/entities/device-info.entity';

declare global {
  namespace PrismaJson {
    type TemplateSystemPromptType = AssistantTemplatePrompt;
    type TemplateConfigType = AssistantTemplateConfig;
    type DeviceInfoType = DeviceInfo;
  }
}

export {};
