import { SessionData } from '@/modules/session/session.service';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Session = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const { sessionData } = request.user;
  return sessionData as SessionData;
});
