import { z } from 'zod';
import { chatMessageSchema } from '../schemas/chat-message.schema';
import { createZodDto } from 'nestjs-zod';
import { ChatMessageType } from '../enums/chat-message.enum';
import { ChatMessageRole } from '../enums/chat-message-role.enum';

export class ChatMessageDto {
  readonly type: ChatMessageType;
  readonly role: ChatMessageRole;
  readonly content: string;
  readonly visionContent?: any;

  constructor(
    type: ChatMessageType,
    role: ChatMessageRole,
    content: string,
    visionContent?: any,
  ) {
    this.type = type;
    this.role = role;
    this.content = content;
    this.visionContent = visionContent;
  }

  static fromInput(input: {
    type: ChatMessageType;
    role: ChatMessageRole;
    content: string;
    visionContent?: any;
  }): ChatMessageDto {
    return new ChatMessageDto(
      input.type,
      input.role,
      input.content,
      input.visionContent,
    );
  }
}

export class CreateChatMessageDto {
  readonly userId: string;
  readonly chatId: string;
  readonly message: ChatMessageDto;

  constructor(userId: string, chatId: string, chatMessage: ChatMessageDto) {
    this.userId = userId.toLowerCase();
    this.chatId = chatId.toLowerCase();
    this.message = ChatMessageDto.fromInput(chatMessage);
  }

  static fromInput(input: {
    userId: string;
    chatId: string;
    message: ChatMessageDto;
  }): CreateChatMessageDto {
    return new CreateChatMessageDto(input.userId, input.chatId, input.message);
  }
}

const createChatMessageSchema = z.object({
  message: chatMessageSchema,
});

export class CreateChatMessageBody extends createZodDto(
  createChatMessageSchema,
) {}
