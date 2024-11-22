import { AssistantEntity } from '@/modules/assistant/entities/assistant.entity';
import { ChatMessageEntity } from '@/modules/chat-message/entities/chat-message.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Chat as ChatModel } from '@prisma/client';

export class ChatEntity implements ChatModel {
  @ApiProperty()
  id: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  assistantId: string;
  @ApiProperty()
  userId: string;

  // Relations
  @ApiProperty()
  user?: UserEntity;
  @ApiProperty()
  assistant?: AssistantEntity;
  @ApiProperty()
  messages?: ChatMessageEntity[];

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  constructor(partial: Partial<ChatEntity>) {
    Object.assign(this, partial);
  }
}
