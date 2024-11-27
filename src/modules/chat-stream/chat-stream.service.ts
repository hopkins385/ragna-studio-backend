import { ChatService } from '@/modules/chat/chat.service';
import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { ChatEntity } from '@/modules/chat/entities/chat.entity';
import { CreateChatStreamDto } from './dto/create-chat-stream.dto';
import { Observable, Subscriber } from 'rxjs';
import {
  CoreMessage,
  LanguageModelUsage,
  LanguageModelV1,
  streamText,
  StreamTextResult,
} from 'ai';
import { ChatEvent } from '@/modules/chat/enums/chat-event.enum';
import { ChatToolCallEventDto } from '@/modules/chat/events/chat-tool-call.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiModelFactory } from '@/modules/ai-model/factories/ai-model.factory';
import { CreateChatMessageDto } from '@/modules/chat-message/dto/create-chat-message.dto';
import { FirstUserMessageEventDto } from '@/modules/chat/events/first-user-message.event';
import { ChatMessageType } from '@/modules/chat-message/enums/chat-message.enum';
import { ChatMessageRole } from '@/modules/chat-message/enums/chat-message-role.enum';
import { ChatToolService } from '@/modules/chat-tool/chat-tool.service';
import { ProviderType } from '../ai-model/enums/provider.enum';

interface StreamContext {
  model: LanguageModelV1;
  chat: ChatEntity;
  isCancelled: boolean;
  chunks: string[];
  subscriber: Subscriber<MessageEvent>;
  toolCallRecursion: number;
  usage: LanguageModelUsage[];
}

export interface ToolInfoData {
  toolName: string;
  toolInfo: any;
}

@Injectable()
export class ChatStreamService {
  private readonly logger = new Logger(ChatStreamService.name);
  private readonly maxToolRecursions = 3;

  constructor(
    private readonly chatService: ChatService,
    private readonly chatToolService: ChatToolService,
    private readonly aiModelFactory: AiModelFactory,
    private readonly event: EventEmitter2,
  ) {}

  createMessageStream(
    chat: ChatEntity,
    payload: CreateChatStreamDto,
    signal: AbortSignal,
  ) {
    return new Observable((subscriber: Subscriber<MessageEvent>) => {
      const model = this.aiModelFactory
        .setConfig({
          provider: payload.provider,
          model: payload.model,
        })
        .getModel();

      const context: StreamContext = {
        model,
        chat,
        isCancelled: false,
        chunks: [],
        subscriber,
        toolCallRecursion: 0,
        usage: [],
      };

      const stream = this.generateStream(signal, context, payload);

      (async () => {
        try {
          for await (const chunk of stream) {
            if (context.isCancelled || signal.aborted) {
              return;
            }

            context.chunks.push(chunk);
            this.emitMessage(chunk, subscriber);

            await new Promise((resolve) => setTimeout(resolve, 10));
          }

          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })();

      return async () => {
        try {
          return await this.finalize(context, signal);
        } catch (error: any) {
          this.logger.error(`Error: ${error?.message}`);
        }
      };
    });
  }

  private async finalize(
    context: StreamContext,
    signal: AbortSignal,
  ): Promise<void> {
    context.isCancelled = true;
    if (signal.aborted) {
      // TODO: token usage for incomplete messages
    }

    return this.saveMessage(context.chat.id, {
      userId: context.chat.userId,
      content: context.chunks.join(''),
      role: ChatMessageRole.ASSISTANT,
      timestamp: new Date(),
      isComplete: true,
      isFirstMessage: context.chat.messages.length < 2,
      usage: context.usage,
    });
  }

  private emitMessage(
    data: string,
    subscriber: Subscriber<MessageEvent>,
  ): void {
    subscriber.next({
      data: { message: data },
      type: 'message',
      id: crypto.randomUUID(),
    });
  }

  async *generateStream(
    signal: AbortSignal,
    context: StreamContext,
    payload: CreateChatStreamDto,
  ) {
    const { settings: callSettings, availableTools } = this.createCallSettings(
      context,
      payload,
    );

    try {
      const initialResult = streamText({
        abortSignal: signal,
        model: context.model,
        messages: payload.messages,
        maxSteps: 1,
        maxRetries: 3,
        ...callSettings,
      });

      // this.logWarnings(initialResult.warnings);

      yield* this.handleStream(
        signal,
        initialResult,
        payload,
        context,
        availableTools,
      );
    } catch (error: any) {
      // this.handleStreamGeneratorError(_event, error);
    }
  }

  private async *handleStream(
    signal: AbortSignal,
    result: StreamTextResult<any>,
    payload: CreateChatStreamDto,
    context: StreamContext,
    availableTools: any,
  ): AsyncGenerator<any, void, any> {
    for await (const chunk of result.fullStream) {
      if (signal.aborted) return;

      if (chunk.type === 'error') {
        throw chunk.error;
      }

      if (chunk.type === 'finish') {
        switch (chunk.finishReason) {
          case 'error':
            throw new Error(`Finish Error: ${JSON.stringify(result.response)}`);
          case 'length':
            // this.onStreamStopLength();
            return;
          case 'tool-calls':
            yield* this.handleToolCalls(
              signal,
              result,
              payload,
              context,
              availableTools,
            );
            return;
        }
      }

      if (chunk.type === 'text-delta') {
        yield chunk.textDelta;
      }
    }

    // usage
    await this.addUsage(context, result);
  }

  private async addUsage(
    context: StreamContext,
    result: StreamTextResult<any>,
  ): Promise<void> {
    const usage = await result.usage;
    console.log('Usage:', usage);
    if (usage) context.usage.push(usage);
  }

  private async *handleToolCalls(
    signal: AbortSignal,
    initalResult: StreamTextResult<any>,
    payload: CreateChatStreamDto,
    context: StreamContext,
    availableTools: any,
  ): AsyncGenerator<any, void, any> {
    context.toolCallRecursion++;
    // Prevent infinite loop
    if (context.toolCallRecursion >= this.maxToolRecursions) {
      throw new Error('Max tool recursion reached');
    }

    await this.addUsage(context, initalResult);

    const [toolCalls, toolResults] = await Promise.all([
      initalResult.toolCalls,
      initalResult.toolResults,
    ]);

    // Ensure toolResults is not empty to avoid infinite loop
    if (!toolResults || toolResults.length === 0) {
      this.logger.warn('No tool results, exiting generator.');
      return;
    }

    const toolMessages: CoreMessage[] = [
      { role: 'assistant', content: toolCalls },
      { role: 'tool', content: toolResults },
    ];

    try {
      const result = streamText({
        abortSignal: signal,
        model: context.model,
        // system: payload.systemPrompt,
        messages: [...payload.messages, ...toolMessages],
        // maxTokens: payload.maxTokens,
        tools: availableTools,
        maxSteps: 1,
        maxRetries: 3,
      });

      const toolName = toolResults[0]?.toolName || '';
      this.onToolEndCall(
        ChatToolCallEventDto.fromInput({
          userId: context.chat.userId,
          chatId: context.chat.id,
          toolName,
        }),
      );

      for await (const chunk of result.fullStream) {
        if (signal.aborted) return;

        if (chunk.type === 'error') {
          throw chunk.error;
        }

        if (chunk.type === 'finish') {
          switch (chunk.finishReason) {
            case 'error':
              throw new Error(
                `Finish Error: ${JSON.stringify(result.response)}`,
              );
            case 'length':
              // this.onStreamStopLength();
              return;
            case 'tool-calls':
              // call itself recursively
              yield* this.handleToolCalls(
                signal,
                result,
                payload,
                context,
                availableTools,
              );
              return;
          }
        }

        if (chunk.type === 'text-delta') {
          yield chunk.textDelta;
        }
      }

      // usage
      await this.addUsage(context, result);

      //
    } catch (error) {
      return; // TODO: check if silent discard is ok
    } finally {
      // usage
      // await this.addUsage(context, result);
    }
  }

  private async saveMessage(
    chatId: string,
    messageData: {
      userId: string;
      content: string;
      role: ChatMessageRole.ASSISTANT;
      timestamp: Date;
      isComplete: boolean;
      isFirstMessage: boolean;
      usage?: LanguageModelUsage[];
    },
  ) {
    console.log('Saving message:', messageData);
    // Update chat title if it's the first message of the chat
    if (messageData.isFirstMessage) {
      this.event.emit(
        ChatEvent.FIRST_USERMESSAGE,
        FirstUserMessageEventDto.fromInput({
          chatId,
          userId: messageData.userId,
          messageContent: messageData.content,
        }),
      );
    }
    const payload = CreateChatMessageDto.fromInput({
      userId: messageData.userId,
      chatId,
      message: {
        type: ChatMessageType.TEXT,
        role: messageData.role,
        content: messageData.content,
      },
    });
    await this.chatService.createMessageAndReduceCredit(payload);
  }

  // UTILS

  private createCallSettings(
    context: StreamContext,
    payload: CreateChatStreamDto,
  ) {
    const isPreview = payload.model.startsWith('o1-');
    const filterTools = () => {
      switch (payload.provider) {
        case ProviderType.GROQ:
        case ProviderType.MISTRAL:
          return undefined;
        default:
          return this.chatToolService.getTools(
            payload.functionIds,
            this.toolStartCallback(context),
          );
      }
    };

    const availableTools = filterTools();

    return {
      availableTools,
      settings: isPreview
        ? {}
        : {
            // system: payload.systemPrompt,
            tools: availableTools,
            maxTokens: payload.maxTokens,
            temperature: payload.temperature,
          },
    };
  }

  private toolStartCallback(context: StreamContext) {
    return (toolInfoData: ToolInfoData) =>
      this.onToolStartCall(
        ChatToolCallEventDto.fromInput({
          userId: context.chat.userId,
          chatId: context.chat.id,
          toolName: toolInfoData.toolName,
          toolInfo: toolInfoData.toolInfo,
        }),
      );
  }

  private onToolEndCall(payload: ChatToolCallEventDto) {
    this.event.emit(ChatEvent.TOOL_END_CALL, payload);
  }

  private onToolStartCall(payload: ChatToolCallEventDto) {
    this.event.emit(ChatEvent.TOOL_START_CALL, payload);
  }
}
