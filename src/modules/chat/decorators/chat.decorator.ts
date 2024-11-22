import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ChatRequest } from '../interfaces/chat-request.interface';

export const ReqChat_DONTUSE = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as ChatRequest;
    const { chat } = request;
    return chat;
  },
);
