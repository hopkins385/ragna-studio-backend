import { ChatMessage } from '@prisma/client';

export interface UpsertMessage extends ChatMessage {
  id: string;
}

export interface UpsertChatMessages {
  chatId: string;
  chatMessages: UpsertMessage[];
}

export interface UpsertChat {
  chatId: string;
}
