import { ChatService } from '@/modules/chat/chat.service';
import { Injectable, Logger } from '@nestjs/common';
import { ChatEntity } from '@/modules/chat/entities/chat.entity';
import { CreateChatStreamDto } from './dto/create-chat-stream.dto';
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
import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import { Readable, Transform } from 'node:stream';
import fastJson from 'fast-json-stringify';

type LanguageModelUsageType = 'text' | 'tool';

interface StreamContext {
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

export interface ToolInfoData {
  toolName: string;
  toolInfo: any;
}

const stringify = fastJson({
  title: 'Chat Event Message Schema',
  type: 'object',
  properties: {
    message: {
      type: 'string',
    },
  },
});

@Injectable()
export class ChatStreamService {
  private readonly logger = new Logger(ChatStreamService.name);
  private readonly MAX_TOOL_RECURSIONS = 3;
  private readonly DEFAULT_STREAM_DELAY_MS = 10;

  constructor(
    private readonly chatService: ChatService,
    private readonly chatToolService: ChatToolService,
    private readonly aiModelFactory: AiModelFactory,
    private readonly event: EventEmitter2,
  ) {}

  async createMessageStream(
    chat: ChatEntity,
    payload: CreateChatStreamDto,
    abortController: AbortController,
  ): Promise<Readable> {
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
      toolCallRecursion: 0,
      usages: [],
    };

    //
    // TODO: RAG implementation
    //
    if (chat.assistant.hasKnowledgeBase) {
    }

    const stream = this.generateStream(
      abortController.signal,
      context,
      payload,
    );

    const readableStream = Readable.from(stream);

    readableStream.on('end', () => {
      this.logger.debug('[ReadableStream] ended');
      this.finalize(context, abortController.signal);
    });

    readableStream.on('error', async (error: any) => {
      // if AbortError, finalize
      if (error?.name === 'AbortError') {
        this.logger.debug('[ReadableStream] aborted');
        return;
      }
      this.logger.error(`[ReadableStream] error: ${error?.message}`);
      // await this.finalize(context, abortController.signal); // TODO: finalize?
      abortController.abort();
    });

    readableStream.on('close', () => {
      this.logger.debug('[ReadableStream] closed');
    });

    readableStream.on('finish', () => {
      this.logger.debug('[ReadableStream] finished');
    });

    const transform = new Transform({
      objectMode: true,
      async transform(chunk, encoding, callback) {
        context.chunks.push(chunk);
        const data = stringify({ message: chunk });
        this.push(`event: delta\ndata: ${data}\n\n`);
        callback();
      },
    });

    transform.on('error', async (error: any) => {
      if (error?.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
        this.logger.error(
          `[Transform stream] error: ${error?.message}, Aborted: ${abortController.signal.aborted}`,
        );
        return;
      }

      this.logger.debug(
        `[Transform stream] error: ${error?.message}; code: ${error?.code}; name: ${error?.name}; Aborted: ${abortController.signal.aborted}`,
      );
      await this.finalize(context, abortController.signal);
      abortController.abort();
    });

    transform.on('drain', () => {
      this.logger.debug('[Transform stream] drain - resuming processing');

      // Resume processing if transform was paused
      if (transform.isPaused()) {
        transform.resume();
      }

      // Signal that backpressure has been relieved
      transform.emit('ready');
    });

    transform.on('close', () => {
      this.logger.debug('[Transform stream] close');
    });

    return readableStream.pipe(transform);
  }

  private async finalize(
    context: StreamContext,
    signal: AbortSignal,
  ): Promise<void> {
    context.isCancelled = true;
    if (signal.aborted) {
      // TODO: token usage for incomplete messages
      this.logger.debug(`[finalize] aborted: ${signal.aborted}`);
    }

    return this.saveMessage(context.chat.id, {
      userId: context.chat.userId,
      content: context.chunks.join(''),
      role: ChatMessageRole.ASSISTANT,
      timestamp: new Date(),
      isComplete: true,
      isFirstMessage: context.chat.messages.length < 2,
      usage: context.usages as any, // TODO: fix type
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

    this.logger.debug(`[generateStream] payload: ${JSON.stringify(payload)}`);

    const initialResult = streamText({
      abortSignal: signal,
      model: context.model,
      messages: payload.messages,
      maxSteps: 1,
      maxRetries: 3,
      ...callSettings,
    });

    yield* this.handleStream(
      signal,
      initialResult,
      payload,
      context,
      availableTools,
    );
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
        this.logger.debug('[handleStream] chunk error:', chunk.error);
        throw chunk.error;
      }

      if (chunk.type === 'finish') {
        switch (chunk.finishReason) {
          case 'error':
            throw new Error(`Finish Error: ${JSON.stringify(result.response)}`);
          case 'length':
            // this.onStreamStopLength();
            break;
          case 'stop':
            // this.onStreamStop();
            break;
          case 'tool-calls':
            // handle tool calls
            yield* this.handleToolCalls(
              signal,
              result,
              payload,
              context,
              availableTools,
            );
            break;
          default:
            this.logger.warn(
              `[handleStream] Unknown finish reason: ${chunk.finishReason}`,
            );
            break;
        }
      }

      if (chunk.type === 'text-delta') {
        yield chunk.textDelta;
      }

      await this.delayStream();
    }

    // usage
    await this.addUsage('text', context, result);
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
    if (context.toolCallRecursion >= this.MAX_TOOL_RECURSIONS) {
      throw new Error('Max tool recursion reached');
    }

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

    const followUpMessages: CoreMessage[] = [
      ...payload.messages,
      ...toolMessages,
    ];

    const result = streamText({
      abortSignal: signal,
      model: context.model,
      system: payload.systemPrompt,
      messages: followUpMessages,
      maxTokens: payload.maxTokens,
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
        this.logger.debug('[handleToolCalls] chunk error:', chunk.error);
        throw chunk.error;
      }

      if (chunk.type === 'finish') {
        // handle finish
        switch (chunk.finishReason) {
          case 'error':
            throw new Error(`Finish Error: ${JSON.stringify(result.response)}`);
          case 'length':
            // this.onStreamStopLength();
            break;
          case 'stop':
            // this.onStreamStop();
            break;
          case 'tool-calls':
            // call itself recursively
            yield* this.handleToolCalls(
              signal,
              result,
              payload,
              context,
              availableTools,
            );
            break;
          default:
            this.logger.warn(
              `[handleToolCalls] Unknown finish reason: ${chunk.finishReason}`,
            );
            break;
        }
      }

      if (chunk.type === 'text-delta') {
        yield chunk.textDelta;
      }

      await this.delayStream();
    }

    // usage
    await this.addUsage('text', context, result);
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
    this.logger.debug('Saving message:', messageData);
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

  private async delayStream() {
    return new Promise((resolve) => {
      setTimeout(resolve, this.DEFAULT_STREAM_DELAY_MS);
    });
  }

  private async addUsage(
    usageType: LanguageModelUsageType,
    context: StreamContext,
    result: StreamTextResult<any>,
  ): Promise<void> {
    const usage = {
      type: usageType,
      tokens: await result.usage,
    };
    this.logger.debug('Usage:', usage);

    if (usage) context.usages.push(usage);
  }

  private createCallSettings(
    context: StreamContext,
    payload: CreateChatStreamDto,
  ) {
    const isPreview = payload.model.startsWith('o1-');

    const availableTools = this.chatToolService.getTools({
      llmProvider: payload.provider,
      llmName: payload.model,
      functionIds: payload.functionIds,
      emitToolInfoData: this.toolStartCallback(context),
    });

    return {
      availableTools,
      settings: isPreview
        ? {}
        : {
            system: payload.systemPrompt,
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
