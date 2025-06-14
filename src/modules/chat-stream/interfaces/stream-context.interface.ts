import { ChatEntity } from '@/modules/chat/entities/chat.entity';
import { LanguageModelUsage, LanguageModelV1 } from 'ai';

export type LanguageModelUsageType = 'text' | 'tool';

export interface StreamContext {
  model: LanguageModelV1;
  chat: ChatEntity;
  isCancelled: boolean;
  chunks: string[];
  toolCallRecursion: number;
  usages: {
    type: LanguageModelUsageType;
    tokens: LanguageModelUsage;
  }[];
}
