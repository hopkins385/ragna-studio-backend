import { z } from 'zod';
import { chatMessageSchema } from '../schemas/chat-message.schema';
import { createZodDto } from 'nestjs-zod';
import { ChatMessageType } from '../enums/chat-message.enum';
import { ChatMessageRole } from '../enums/chat-message-role.enum';

interface ChatMessageContent {
  type: ChatMessageType;
  text: string;
}

export class ChatMessageDto {
  readonly type: ChatMessageType;
  readonly role: ChatMessageRole;
  readonly content: ChatMessageContent;
  readonly visionContent?: any;

  constructor(
    type: ChatMessageType,
    role: ChatMessageRole,
    inputText: string,
    visionContent?: any,
  ) {
    this.type = type;
    this.role = role;
    this.content = {
      type: type,
      text: inputText,
    };
    this.visionContent = visionContent;
  }

  static fromInput(input: {
    type: ChatMessageType;
    role: ChatMessageRole;
    text: string;
    visionContent?: any;
  }): ChatMessageDto {
    return new ChatMessageDto(input.type, input.role, input.text, input.visionContent);
  }
}

export class CreateChatMessageDto {
  readonly userId: string;
  readonly chatId: string;
  readonly message: ChatMessageDto;

  constructor(userId: string, chatId: string, chatMessage: ChatMessageDto) {
    this.userId = userId.toLowerCase();
    this.chatId = chatId.toLowerCase();
    this.message = ChatMessageDto.fromInput({
      type: chatMessage.type,
      role: chatMessage.role,
      text: chatMessage.content.text,
      visionContent: chatMessage.visionContent,
    });
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

export class CreateChatMessageBody extends createZodDto(createChatMessageSchema) {}
