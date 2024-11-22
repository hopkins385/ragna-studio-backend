import { ChatStreamService } from './chat-stream.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  MessageEvent,
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
import { SocketService } from '../socket/socket.service';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const logger = new Logger('ChatStreamController');

@Controller('chat-stream')
export class ChatStreamController {
  private readonly SSE_TIMEOUT = 240000; // 240 seconds (4 minutes)

  constructor(
    private readonly chatService: ChatService,
    private readonly chatStreamService: ChatStreamService,
    private readonly socket: SocketService,
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
    const { id: chatId } = param;
    const abortController = new AbortController();

    const chat = await this.chatService.getChatForUser(chatId, user.id);

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const handleReqClose = () => {
      abortController.abort();
    };

    req.on('close', handleReqClose);
    req.socket.on('close', handleReqClose);

    const handleResDrain = () => {};
    const handleResError = (error) => {};

    res.on('drain', handleResDrain);
    res.on('error', handleResError);
    res.socket.on('drain', handleResDrain);
    res.socket.on('error', handleResError);

    const payload = CreateChatStreamDto.fromInput({
      provider: body.provider,
      model: body.model,
      // @ts-ignore
      messages: this.chatService.formatChatMessages(body.messages),
      functionIds: chat.assistant.tools.map((t) => t.tool.functionId),
    });

    const stream = this.chatStreamService
      .createMessageStream(chat, payload, abortController.signal)
      .pipe(
        timeout({
          first: this.SSE_TIMEOUT,
          with: () => {
            throw new RequestTimeoutException();
          },
        }),
        catchError((error) => {
          // Handle stream errors
          logger.error('Stream error:', error);
          throw new HttpException(
            'Stream closed unexpectedly',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
        finalize(() => {
          // Clean up listeners
          req.off('close', handleReqClose);
          req.socket.off('close', handleReqClose);
        }),
      );

    return stream;
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
