import { z } from 'zod';
import { chatMessageSchema } from '../schemas/chat-message.schema';
import { createZodDto } from 'nestjs-zod';
import { ChatMessageType } from '../enums/chat-message.enum';
import { ChatMessageRole } from '../enums/chat-message-role.enum';

export interface ChatMessageToolCall {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: any;
}

export interface ChatMessageToolResult {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  args: any;
  result: any;
}

export interface ChatMessageText {
  type: ChatMessageType;
  text: string;
}
// union type for all message types
export type ChatMessageContent = ChatMessageText | ChatMessageToolCall | ChatMessageToolResult;

// Helper type guard
export function isTextMessage(content: ChatMessageContent): content is ChatMessageText {
  return content.type === 'text';
}

export class ChatMessageDto {
  readonly type: ChatMessageType;
  readonly role: ChatMessageRole;
  readonly content: ChatMessageContent[];
  readonly visionContent?: any;

  constructor(
    type: ChatMessageType,
    role: ChatMessageRole,
    content: ChatMessageContent[],
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
    content: ChatMessageContent[];
    visionContent?: any;
  }): ChatMessageDto {
    return new ChatMessageDto(input.type, input.role, input.content, input.visionContent);
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
      content: chatMessage.content,
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
