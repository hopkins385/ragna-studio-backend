import { AuthUserEntity } from '@/modules/auth/entities/auth-user.entity';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const { authUser } = request.user;
  return authUser as AuthUserEntity;
});
