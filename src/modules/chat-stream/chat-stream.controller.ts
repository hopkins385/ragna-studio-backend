import { ChatStreamService } from './chat-stream.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { CreateChatStreamDto } from './dto/create-chat-stream.dto';
import { Request, Response } from 'express';
import { ChatService } from '@/modules/chat/chat.service';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { CreateChatStreamBody } from './dto/create-chat-stream-body.dto';
import { ChatEntity } from '@/modules/chat/entities/chat.entity';
import { pipeline } from 'node:stream/promises';
import { defaultAnswerProtocolPrompt } from './prompts/default-system.prompt';

interface StreamHandlers {
  onClose: () => void;
  onDrain: () => void;
  onError: (error: Error) => void;
}

@Controller('chat-stream')
export class ChatStreamController {
  private readonly logger = new Logger(ChatStreamController.name);
  private readonly SSE_TIMEOUT = 240000; // 240 seconds (4 minutes)

  constructor(
    private readonly chatService: ChatService,
    private readonly chatStreamService: ChatStreamService,
  ) {}

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async createChatMessageStream(
    @ReqUser() user: UserEntity,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param() param: IdParam,
    @Body() body: CreateChatStreamBody,
  ) {
    const abortController = new AbortController();
    const handlers = this.setupStreamHandlers(req, res, abortController);

    const chat = await this.chatService.getChatForUser({
      chatId: param.id,
      userId: user.id,
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Set stream headers
    this.setStreamHeaders(res);

    const payload = this.createChatStreamPayload(body, chat);

    try {
      const readableStream = await this.chatStreamService.createMessageStream(
        chat,
        payload,
        abortController,
      );

      await pipeline(readableStream, res, {
        signal: abortController.signal,
      });
      //
    } catch (error: any) {
      if (error?.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
        this.logger.error(`Stream pipeline error: ${error?.message}`);
        throw new InternalServerErrorException('Stream pipeline error');
      }
    } finally {
      this.finalizeStream(req, res, handlers);
    }
  }

  private createChatStreamPayload(
    body: CreateChatStreamBody,
    chat: ChatEntity,
  ): CreateChatStreamDto {
    // timestamp
    const timestamp = '\n\n' + 'Timestamp now(): ' + new Date().toISOString();

    const systemPrompt = chat.assistant.systemPrompt + defaultAnswerProtocolPrompt + timestamp;

    const provider = chat.assistant.llm?.provider;
    const model = chat.assistant.llm?.apiName;

    return CreateChatStreamDto.fromInput({
      provider: body.provider ?? provider,
      model: body.model ?? model,
      systemPrompt,
      messages: this.chatService.formatChatMessages(body.messages as any),
      functionIds: chat.assistant.tools.map((t) => t.tool.functionId),
      maxTokens: body.maxTokens,
      temperature: body.temperature / 100,
      reasoningEffort: body.reasoningEffort,
    });
  }

  private setupStreamHandlers(
    req: Request,
    res: Response,
    abortController: AbortController,
  ): StreamHandlers {
    const handlers = {
      onClose: () => {
        this.logger.debug('request closed, aborting stream');
        abortController.abort();
      },
      onDrain: () => {
        this.logger.error('drained, which is unhandled');
      },
      onError: (error: Error) => {
        this.logger.error(`error: ${error.message}`);
        abortController.abort();
      },
    };

    // Setup request handlers
    req.on('close', handlers.onClose);
    req.socket.on('close', handlers.onClose);
    // Setup response handlers
    res.on('drain', handlers.onDrain);
    res.on('error', handlers.onError);

    return handlers;
  }

  private finalizeStream(req: Request, res: Response, handlers: StreamHandlers) {
    // Cleanup all listeners
    req.off('close', handlers.onClose);
    req.socket.off('close', handlers.onClose);
    res.off('drain', handlers.onDrain);
    res.off('error', handlers.onError);
  }

  private setStreamHeaders(res: Response) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('X-Ragna-Stream', 'v1');
  }
}
