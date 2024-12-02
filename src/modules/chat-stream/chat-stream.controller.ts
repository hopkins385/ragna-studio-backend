import { ChatStreamService } from './chat-stream.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Req,
  RequestTimeoutException,
  Res,
  Sse,
} from '@nestjs/common';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { CreateChatStreamDto } from './dto/create-chat-stream.dto';
import { catchError, finalize, Observable, timeout } from 'rxjs';
import { Request, Response } from 'express';
import { ChatService } from '@/modules/chat/chat.service';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { CreateChatStreamBody } from './dto/create-chat-stream-body.dto';
import { ChatEntity } from '../chat/entities/chat.entity';

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
  @Sse()
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

    const payload = await this.createChatStreamPayload(body, chat);

    const stream = this.chatStreamService
      .createMessageStream(chat, payload, abortController.signal)
      .pipe(
        timeout({
          first: this.SSE_TIMEOUT,
          with: () => {
            throw new RequestTimeoutException();
          },
        }),
        catchError((error: any) => {
          this.logger.error(`Error: ${error?.message}`);
          throw new HttpException(
            'Stream closed unexpectedly',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
        finalize(() => {
          this.finalizeStream(req, res, handlers);
        }),
      );

    return stream;
  }

  private async createChatStreamPayload(
    body: CreateChatStreamBody,
    chat: ChatEntity,
  ): Promise<CreateChatStreamDto> {
    //
    // TODO: RAG implementation
    //
    return CreateChatStreamDto.fromInput({
      provider: body.provider,
      model: body.model,
      systemPrompt: chat.assistant.systemPrompt,
      messages: this.chatService.formatChatMessages(body.messages as any),
      functionIds: chat.assistant.tools.map((t) => t.tool.functionId),
      maxTokens: body.maxTokens,
      temperature: body.temperature / 100,
    });
  }

  private setupStreamHandlers(
    req: Request,
    res: Response,
    abortController: AbortController,
  ): StreamHandlers {
    const handlers = {
      onClose: () => {
        abortController.abort();
      },
      onDrain: () => {
        this.logger.error('Stream drained, which is unhandled');
        // TODO: Handle stream draining
      },
      onError: (error: Error) => {
        this.logger.error(`Stream error: ${error.message}`);
        abortController.abort();
      },
    };

    // Setup request handlers
    req.on('close', handlers.onClose);
    req.socket.on('close', handlers.onClose);

    // Setup response handlers
    res.on('drain', handlers.onDrain);
    res.on('error', handlers.onError);
    res.socket.on('drain', handlers.onDrain);
    res.socket.on('error', handlers.onError);

    return handlers;
  }

  private finalizeStream(
    req: Request,
    res: Response,
    handlers: StreamHandlers,
  ) {
    // Cleanup all listeners
    req.off('close', handlers.onClose);
    req.socket.off('close', handlers.onClose);
    res.off('drain', handlers.onDrain);
    res.off('error', handlers.onError);
    res.socket.off('drain', handlers.onDrain);
    res.socket.off('error', handlers.onError);
  }
}

/*
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Accel-Buffering', 'no');

        const messageStream = this.chatStreamService.createMessageStream(
      chat,
      payload,
      abortController.signal,
    );

    const stream = Readable.from(messageStream);

    await pipeline(stream, res);

    */
