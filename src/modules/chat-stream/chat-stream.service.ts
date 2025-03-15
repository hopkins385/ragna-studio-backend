import { TokenUsageEventEmitter } from './../token-usage/events/token-usage-event.emitter';
import { ChatService } from '@/modules/chat/chat.service';
import { Injectable, Logger } from '@nestjs/common';
import { ChatEntity } from '@/modules/chat/entities/chat.entity';
import { CreateChatStreamDto } from './dto/create-chat-stream.dto';
import { CoreMessage, LanguageModelUsage, LanguageModelV1, streamText, StreamTextResult } from 'ai';
import { ChatToolCallEventDto } from '@/modules/chat/events/chat-tool-call.event';
import { AiModelFactory } from '@/modules/ai-model/factories/ai-model.factory';
import { CreateChatMessageDto } from '@/modules/chat-message/dto/create-chat-message.dto';
import { ChatMessageType } from '@/modules/chat-message/enums/chat-message.enum';
import { ChatMessageRole } from '@/modules/chat-message/enums/chat-message-role.enum';
import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import { Readable, Transform } from 'node:stream';
import fastJson from 'fast-json-stringify';
import { ConfigService } from '@nestjs/config';
import { AssistantToolFunctionService } from '../assistant-tool-function/assistant-tool-function.service';
import { FirstUserMessageEventDto } from '../chat/events/first-user-message.event';
import { ChatEventEmitter } from '../chat/events/chat-event.emitter';
import { TokenUsageEventDto } from '../token-usage/events/token-usage-event.dto';

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
  private readonly THINKING_CONFIGS = {
    0: { type: 'disabled' },
    1: { type: 'enabled', budgetTokens: 12000 },
    2: { type: 'enabled', budgetTokens: 24000 },
    3: { type: 'enabled', budgetTokens: 48000 },
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
    private readonly chatEvent: ChatEventEmitter,
    private readonly tokenUsageEvent: TokenUsageEventEmitter,
    private readonly toolFunctionService: AssistantToolFunctionService,
  ) {}

  async createMessageStream(
    chat: ChatEntity,
    payload: CreateChatStreamDto,
    abortController: AbortController,
  ): Promise<Readable> {
    this.logger.debug('Creating chat message stream:', payload);

    const modelFactory = new AiModelFactory(this.configService);

    modelFactory.setConfig({
      provider: payload.provider,
      model: payload.model,
    });

    if (
      (payload.provider === ProviderType.OPENAI && payload.model.startsWith('o1-')) ||
      payload.model.startsWith('o3-')
    ) {
      modelFactory.setOptions({
        reasoningEffort: 'high',
      });
    }

    const context: StreamContext = {
      model: modelFactory.getModel(),
      chat,
      isCancelled: false,
      chunks: [],
      toolCallRecursion: 0,
      usages: [],
    };

    const stream = this.generateStream(abortController.signal, context, payload);

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

  private async finalize(context: StreamContext, signal: AbortSignal): Promise<void> {
    context.isCancelled = true;
    if (signal.aborted) {
      // TODO: token usage for incomplete messages
      this.logger.debug(`[finalize] aborted: ${signal.aborted}`);
    }

    const usage = {
      tokens: context.usages.reduce(
        (acc, curr) => {
          acc.prompt += curr.tokens.promptTokens;
          acc.completion += curr.tokens.completionTokens;
          acc.reasoning = 0;
          acc.total += curr.tokens.totalTokens;
          return acc;
        },
        {
          prompt: 0,
          completion: 0,
          reasoning: 0,
          total: 0,
        },
      ),
    };

    const llmId = context.chat.assistant?.llm.id;
    if (!llmId) {
      this.logger.error('[finalize] LLM ID not found');
    }

    this.tokenUsageEvent.emitTokenUsage(
      TokenUsageEventDto.fromInput({
        userId: context.chat.userId,
        modelId: llmId,
        tokens: usage.tokens,
      }),
    );

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

  async *generateStream(signal: AbortSignal, context: StreamContext, payload: CreateChatStreamDto) {
    const { settings: callSettings, availableTools } = this.createCallSettings(context, payload);

    this.logger.debug(`[generateStream] payload:`, payload);

    const initialResult = streamText({
      abortSignal: signal,
      model: context.model,
      messages: payload.messages,
      maxSteps: 1,
      maxRetries: 3,
      toolChoice: 'auto',
      ...callSettings,
    });

    yield* this.handleStream(signal, initialResult, payload, context, availableTools);
  }

  private async *handleStream(
    signal: AbortSignal,
    result: StreamTextResult<any, unknown>,
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
            yield* this.handleToolCalls(signal, result, payload, context, availableTools);
            break;
          default:
            this.logger.warn(`[handleStream] Unknown finish reason: ${chunk.finishReason}`);
            break;
        }
      }

      if (chunk.type === 'reasoning') {
        yield chunk.textDelta;
      }

      if (chunk.type === 'text-delta') {
        yield chunk.textDelta;
      }

      await this.sleep();
    }

    // usage
    await this.addUsage('text', context, result);
  }

  private async *handleToolCalls(
    signal: AbortSignal,
    initalResult: StreamTextResult<any, unknown>,
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

    const followUpMessages: CoreMessage[] = [...payload.messages, ...toolMessages];

    const result = streamText({
      abortSignal: signal,
      model: context.model,
      system: payload.systemPrompt,
      messages: followUpMessages,
      maxTokens: payload.maxTokens,
      tools: availableTools,
      toolChoice: 'auto',
      maxSteps: 1,
      maxRetries: 3,
    });

    this.chatEvent.emitToolEndCall(
      ChatToolCallEventDto.fromInput({
        userId: context.chat.userId,
        chatId: context.chat.id,
        toolName: toolResults[0]?.toolName || '',
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
            yield* this.handleToolCalls(signal, result, payload, context, availableTools);
            break;
          default:
            this.logger.warn(`[handleToolCalls] Unknown finish reason: ${chunk.finishReason}`);
            break;
        }
      }

      if (chunk.type === 'reasoning') {
        yield chunk.textDelta;
      }

      if (chunk.type === 'text-delta') {
        yield chunk.textDelta;
      }

      await this.sleep();
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
    // FirstMessage Event
    if (messageData.isFirstMessage) {
      this.chatEvent.emitIsFirstChatMessage(
        FirstUserMessageEventDto.fromInput({
          userId: messageData.userId,
          chatId,
          messageContent: messageData.content,
        }),
      );
    }
    // Create message and reduce credit
    await this.chatService.createMessageAndReduceCredit(
      CreateChatMessageDto.fromInput({
        userId: messageData.userId,
        chatId,
        message: {
          type: ChatMessageType.TEXT,
          role: messageData.role,
          content: messageData.content,
        },
      }),
    );
  }

  // UTILS

  private async sleep() {
    return new Promise((resolve) => {
      setTimeout(resolve, this.DEFAULT_STREAM_DELAY_MS);
    });
  }

  private async addUsage(
    usageType: LanguageModelUsageType,
    context: StreamContext,
    result: StreamTextResult<any, unknown>,
  ): Promise<void> {
    const usage = {
      type: usageType,
      tokens: await result.usage,
    };
    this.logger.debug('Usage:', usage);

    if (usage) context.usages.push(usage);
  }

  private createCallSettings(context: StreamContext, payload: CreateChatStreamDto) {
    // Get available tools
    const availableTools = this.toolFunctionService.getTools({
      userId: context.chat.userId,
      llmProvider: payload.provider,
      llmName: payload.model,
      functionIds: payload.functionIds,
      assistantId: context.chat.assistant.id,
      emitToolInfoData: this.toolStartCallback(context),
    });

    // Get settings
    const settings = {
      system: payload.systemPrompt,
      tools: availableTools,
      maxTokens: payload.maxTokens,
      temperature: payload.temperature,
      providerOptions: this.getProviderOptions(payload),
    };

    return {
      availableTools,
      settings,
    };
  }

  private getProviderOptions(payload: CreateChatStreamDto) {
    return {
      anthropic: {
        thinking: this.THINKING_CONFIGS[payload.reasoningEffort],
      },
    };
  }

  private toolStartCallback(context: StreamContext) {
    return (toolInfoData: ToolInfoData) =>
      this.chatEvent.emitToolStartCall(
        ChatToolCallEventDto.fromInput({
          userId: context.chat.userId,
          chatId: context.chat.id,
          toolName: toolInfoData.toolName,
          toolInfo: toolInfoData.toolInfo,
        }),
      );
  }
}
