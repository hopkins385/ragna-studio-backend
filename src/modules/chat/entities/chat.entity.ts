import { AssistantEntity } from '@/modules/assistant/entities/assistant.entity';
import { ChatMessageEntity } from '@/modules/chat-message/entities/chat-message.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Chat as ChatModel } from '@prisma/client';

export class ChatEntity implements ChatModel {
  id: string;
  title: string;
  assistantId: string;
  userId: string;

  // Relations
  user?: UserEntity;
  assistant?: AssistantEntity;
  messages?: ChatMessageEntity[];

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  constructor(partial: Partial<ChatEntity>) {
    this.id = partial.id;
    this.title = partial.title;
    this.assistantId = partial.assistantId;
    this.userId = partial.userId;
    this.user = partial.user;
    this.assistant = partial.assistant;
    this.messages = partial.messages;
    this.createdAt = partial.createdAt;
    this.updatedAt = partial.updatedAt;
    this.deletedAt = partial.deletedAt;
  }
}
