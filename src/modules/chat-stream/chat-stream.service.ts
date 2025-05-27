import { AiModelFactory } from '@/modules/ai-model/factories/ai-model.factory';
import { CreateChatMessageDto } from '@/modules/chat-message/dto/create-chat-message.dto';
import { ChatMessageRole } from '@/modules/chat-message/enums/chat-message-role.enum';
import { ChatMessageType } from '@/modules/chat-message/enums/chat-message.enum';
import { ChatService } from '@/modules/chat/chat.service';
import { ChatEntity } from '@/modules/chat/entities/chat.entity';
import { ChatToolCallEventDto } from '@/modules/chat/events/chat-tool-call.event';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoreMessage, LanguageModelUsage, LanguageModelV1, streamText, StreamTextResult } from 'ai';
import fastJson from 'fast-json-stringify';
import { Readable, Transform } from 'node:stream';
import { AssistantToolFunctionService } from '../assistant-tool-function/assistant-tool-function.service';
import { ChatEventEmitter } from '../chat/events/chat-event.emitter';
import { FirstUserMessageEventDto } from '../chat/events/first-user-message.event';
import { TokenUsageEventDto } from '../token-usage/events/token-usage-event.dto';
import { TokenUsageEventEmitter } from './../token-usage/events/token-usage-event.emitter';
import { CreateChatStreamDto } from './dto/create-chat-stream.dto';

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
  private readonly MAX_RETRIES = 10;
  private readonly MAX_TOOL_RECURSIONS = 20;
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

  /**
   * Creates a stream of chat messages
   * @param chat - The chat entity
   * @param chatStreamDto - The dto containing the request data
   * @param abortController - The abort controller to cancel the stream
   * @returns
   */
  async createMessageStream(
    payload: {
      chat: ChatEntity;
      chatStreamDto: CreateChatStreamDto;
    },
    options: {
      abortController: AbortController;
    },
  ): Promise<Readable> {
    const { chat, chatStreamDto } = payload;
    const { abortController } = options;
    const { signal: abortSignal } = abortController;

    const modelFactory = new AiModelFactory(this.configService);

    modelFactory.setConfig({
      provider: chatStreamDto.provider,
      model: chatStreamDto.model,
    });

    /*if (
      (payload.provider === ProviderType.OPENAI && payload.model.startsWith('o1-')) ||
      payload.model.startsWith('o3-')
    ) {
      modelFactory.setOptions({
        reasoningEffort: 'high',
      });
    }*/

    const context: StreamContext = {
      model: modelFactory.getModel(),
      chat,
      isCancelled: false,
      chunks: [],
      toolCallRecursion: 0,
      usages: [],
    };

    const stream = this.createTextStream(
      {
        context,
        chatStreamDto,
      },
      {
        abortSignal,
      },
    );

    const readableStream = Readable.from(stream);

    readableStream.on('end', () => {
      this.logger.debug('[ReadableStream] ended');
      this.finalize(context, abortSignal);
    });

    readableStream.on('error', async (error: any) => {
      // if AbortError, finalize
      if (error?.name === 'AbortError') {
        this.logger.debug('[ReadableStream] aborted');
        return;
      }
      this.logger.error(`[ReadableStream] error: ${error?.message}`);
      // await this.finalize(context, abortController.abortSignal); // TODO: finalize?
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
          `[Transform stream] error: ${error?.message}, Aborted: ${abortSignal.aborted}`,
        );
        return;
      }

      this.logger.debug(
        `[Transform stream] error: ${error?.message}; code: ${error?.code}; name: ${error?.name}; Aborted: ${abortSignal.aborted}`,
      );
      await this.finalize(context, abortSignal);
      abortController.abort();
    });

    transform.on('drain', () => {
      this.logger.debug('[Transform stream] drain - resuming processing');

      // Resume processing if transform was paused
      if (transform.isPaused()) {
        transform.resume();
      }

      // abortSignal that backpressure has been relieved
      transform.emit('ready');
    });

    transform.on('close', () => {
      this.logger.debug('[Transform stream] close');
    });

    return readableStream.pipe(transform);
  }

  /**
   * Creates a text stream
   * @param context - StreamContext containing model and chat information
   * @param chatStreamDto - CreateChatStreamDto containing the request payload
   * @param abortSignal - AbortSignal to cancel the stream
   * @return AsyncGenerator yielding handleTextStream which yields text chunks and tool calls
   */
  async *createTextStream(
    payload: {
      context: StreamContext;
      chatStreamDto: CreateChatStreamDto;
    },
    options: {
      abortSignal: AbortSignal;
    },
  ): AsyncGenerator<any, void, any> {
    const { context, chatStreamDto } = payload;
    const { abortSignal } = options;

    const { settings: callSettings, availableTools } = this.createCallSettings({
      context,
      chatStreamDto,
    });

    const streamTextResult = streamText({
      abortSignal,
      model: payload.context.model,
      messages: payload.chatStreamDto.messages,
      maxSteps: 1,
      maxRetries: this.MAX_RETRIES,
      toolChoice: 'auto',
      ...callSettings,
    });

    yield* this.handleTextStream(
      {
        streamTextResult,
        chatStreamDto,
        context,
        availableTools,
      },
      {
        abortSignal,
      },
    );
  }

  /**
   * Handles the text stream
   * @param streamTextResult - The streamText object for accessing the stream
   * @param chatStreamDto - CreateChatStreamDto containing the request payload
   * @param context - StreamContext containing model and chat information
   * @param availableTools - Available tools for the ai model
   * @param abortSignal - AbortSignal to cancel the stream
   * @returns AsyncGenerator yielding text chunks
   */
  private async *handleTextStream(
    payload: {
      streamTextResult: StreamTextResult<any, unknown>;
      chatStreamDto: CreateChatStreamDto;
      context: StreamContext;
      availableTools: any;
    },
    options: {
      abortSignal: AbortSignal;
    },
  ): AsyncGenerator<any, void, any> {
    const { streamTextResult, chatStreamDto, context, availableTools } = payload;
    const { abortSignal } = options;

    for await (const chunk of streamTextResult.fullStream) {
      if (abortSignal.aborted) return;

      if (chunk.type === 'error') {
        throw chunk.error;
      }

      if (chunk.type === 'finish') {
        switch (chunk.finishReason) {
          case 'error':
            throw new Error(`Finish Error: ${JSON.stringify(streamTextResult.response)}`);
          case 'length':
            // this.onStreamStopLength();
            break;
          case 'stop':
            // this.onStreamStop();
            break;
          case 'tool-calls':
            // handle tool calls
            yield* this.handleToolCalls(
              {
                streamTextResult,
                chatStreamDto,
                context,
                availableTools,
              },
              {
                abortSignal,
              },
            );
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
    await this.addUsage('text', context, streamTextResult);
  }

  /**
   * Handles tool calls and streams the results
   * @param streamTextResult - The initial result object for accessing different stream types and additional information.
   * @param payload - CreateChatStreamDto containing the request payload
   * @param context - StreamContext containing model and chat information
   * @param availableTools - Available tools for the ai model
   * @param abortSignal - AbortSignal to cancel the stream
   * @returns AsyncGenerator yielding tool call results
   */
  private async *handleToolCalls(
    payload: {
      streamTextResult: StreamTextResult<any, unknown>;
      chatStreamDto: CreateChatStreamDto;
      context: StreamContext;
      availableTools: any;
    },
    options: {
      abortSignal: AbortSignal;
    },
  ): AsyncGenerator<any, void, any> {
    const { streamTextResult, chatStreamDto, context, availableTools } = payload;
    const { abortSignal } = options;

    context.toolCallRecursion++;
    // Prevent infinite loop
    if (context.toolCallRecursion >= this.MAX_TOOL_RECURSIONS) {
      throw new Error('Max tool recursion reached');
    }

    const [toolCalls, toolResults] = await Promise.all([
      streamTextResult.toolCalls,
      streamTextResult.toolResults,
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

    chatStreamDto.messages.push(...toolMessages);

    // store tool call in database
    await this.chatService.createMessage({
      userId: context.chat.userId,
      chatId: context.chat.id,
      message: {
        type: ChatMessageType.TOOL_CALL,
        role: ChatMessageRole.ASSISTANT,
        content: toolCalls as any,
      },
    });

    await this.chatService.createMessage({
      userId: context.chat.userId,
      chatId: context.chat.id,
      message: {
        type: ChatMessageType.TOOL_RESULT,
        role: ChatMessageRole.TOOL,
        content: toolResults as any,
      },
    });

    const toolCallStreamTextResult = streamText({
      abortSignal: abortSignal,
      model: context.model,
      system: chatStreamDto.systemPrompt,
      messages: chatStreamDto.messages,
      maxTokens: chatStreamDto.maxTokens,
      tools: availableTools,
      toolChoice: 'auto',
      maxSteps: 1,
      maxRetries: this.MAX_RETRIES,
    });

    this.chatEvent.emitToolEndCall(
      ChatToolCallEventDto.fromInput({
        userId: context.chat.userId,
        chatId: context.chat.id,
        toolName: toolResults[0]?.toolName || '',
      }),
    );

    let isFirstTextDelta = true;

    for await (const chunk of toolCallStreamTextResult.fullStream) {
      if (abortSignal.aborted) return;

      if (chunk.type === 'error') {
        throw chunk.error;
      }

      if (chunk.type === 'finish') {
        // handle finish
        switch (chunk.finishReason) {
          case 'error':
            throw new Error(`Finish Error: ${JSON.stringify(toolCallStreamTextResult.response)}`);
          case 'length':
            // this.onStreamStopLength();
            break;
          case 'stop':
            // this.onStreamStop();
            break;
          case 'tool-calls':
            // call itself recursively
            yield* this.handleToolCalls(
              {
                streamTextResult: toolCallStreamTextResult,
                chatStreamDto,
                context,
                availableTools,
              },
              { abortSignal },
            );
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
        // add \n\n to the first iteration
        if (isFirstTextDelta) {
          yield `\n\n${chunk.textDelta}`;
          isFirstTextDelta = false;
        } else {
          yield chunk.textDelta;
        }
      }

      await this.sleep();
    }

    // usage
    await this.addUsage('text', context, toolCallStreamTextResult);
  }

  /**
   * Finalizes the stream by saving the message and emitting token usage
   * @param context - StreamContext containing model and chat information
   * @param abortSignal - AbortSignal to cancel the stream
   * @returns
   */
  private async finalize(context: StreamContext, abortSignal: AbortSignal): Promise<void> {
    context.isCancelled = true;
    if (abortSignal.aborted) {
      // TODO: token usage for incomplete messages
      this.logger.debug(`[finalize] aborted: ${abortSignal.aborted}`);
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
    // this.logger.debug('Saving message:', messageData);
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
          content: [
            {
              type: ChatMessageType.TEXT,
              text: messageData.content,
            },
          ],
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

  private createCallSettings(payload: {
    context: StreamContext;
    chatStreamDto: CreateChatStreamDto;
  }) {
    const { context, chatStreamDto } = payload;

    // Get available tools
    const availableTools = this.toolFunctionService.getTools({
      chatId: context.chat.id,
      userId: context.chat.userId,
      llmProvider: chatStreamDto.provider,
      llmName: chatStreamDto.model,
      assistantTools: context.chat.assistant.tools.map((t) => t.tool),
      assistantId: context.chat.assistant.id,
    });

    // Get settings
    const settings = {
      system: chatStreamDto.systemPrompt,
      tools: availableTools,
      maxTokens: chatStreamDto.maxTokens,
      temperature: chatStreamDto.temperature,
      providerOptions: this.getProviderOptions(chatStreamDto),
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
}
