import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '@/modules/user/entities/user.entity';

export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { user } = request;
    return user as UserEntity;
  },
);
