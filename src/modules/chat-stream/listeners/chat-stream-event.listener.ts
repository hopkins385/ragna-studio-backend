import { SocketService } from '@/modules/socket/socket.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChatToolCallEventDto } from '@/modules/chat/events/chat-tool-call.event';
import { ChatEvent } from '@/modules/chat/enums/chat-event.enum';
import { ChatService } from '@/modules/chat/chat.service';
import { CoreMessage, generateText } from 'ai';
import { AiModelFactory } from '@/modules/ai-model/factories/ai-model.factory';
import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import { FirstUserMessageEventDto } from '@/modules/chat/events/first-user-message.event';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatStreamEventListener {
  constructor(
    private readonly socket: SocketService,
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent(ChatEvent.TOOL_START_CALL)
  chatToolCallStartEvent(data: ChatToolCallEventDto) {
    const { userId, chatId, toolName, toolInfo } = data;
    this.socket.emitEvent({
      room: `user:${userId}`,
      event: `chat-${chatId}-tool-start-event`,
      data: { toolName, toolInfo },
    });
  }

  @OnEvent(ChatEvent.TOOL_END_CALL)
  chatToolCallEndEvent(data: ChatToolCallEventDto) {
    const { userId, chatId, toolName } = data;
    this.socket.emitEvent({
      room: `user:${userId}`,
      event: `chat-${chatId}-tool-end-event`,
      data: toolName,
    });
  }

  @OnEvent(ChatEvent.FIRST_USERMESSAGE)
  async firstUserMessageEvent(payload: FirstUserMessageEventDto) {
    const { userId, chatId, messageContent } = payload;
    // limit to max 1000 characters
    const firstMessage = messageContent.slice(0, 1000);

    const messages = [
      {
        role: 'system',
        content: `You are a chat title generator.\n
  Your task is to create a short chat title based on the provided text.\n
  You always only respond with the chat title.`,
      },
      {
        role: 'user',
        content: firstMessage,
      },
    ] satisfies CoreMessage[];

    const modelFactory = new AiModelFactory(this.configService);

    modelFactory.setConfig({
      provider: ProviderType.OPENAI,
      model: 'gpt-4o-mini',
    });

    try {
      const { text } = await generateText({
        model: modelFactory.getModel(),
        messages,
        maxTokens: 20,
      });

      // remove " from the beginning and end of the message
      const chatTitle = text.replace(/^"|"$/g, '');

      await this.chatService.updateChatTitle(chatId, chatTitle);
      //
      // send socket event to user
      const event = `chat-${chatId}-update-title-event`;
      const data = { chatId, chatTitle };
      this.socket.emitEvent({ room: `user:${userId}`, event, data });
      //
    } catch (error) {
      console.error('Error in firstUserMessageEvent', error);
    }
  }
}
