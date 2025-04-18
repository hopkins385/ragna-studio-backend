import { BaseController } from '@/common/controllers/base.controller';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Controller, Post } from '@nestjs/common';
import { SocketService } from './socket.service';

@Controller('socket')
export class SocketController extends BaseController {
  constructor(private readonly socketService: SocketService) {
    super();
  }

  @Post('user-auth')
  async createAuthToken(@ReqUser() { id, roles }: RequestUser) {
    try {
      const token = this.socketService.createAuthToken({
        userId: id,
        roles,
      });
      return { token };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
