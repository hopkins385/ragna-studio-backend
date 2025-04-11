import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { SocketService } from './socket.service';

@Controller('socket')
export class SocketController {
  constructor(private readonly socketService: SocketService) {}

  @Post('user-auth')
  async createAuthToken(@ReqUser() { id, roles }: RequestUser) {
    try {
      const token = this.socketService.createAuthToken({
        userId: id,
        roles,
      });
      return { token };
    } catch (error) {
      throw new InternalServerErrorException('Error creating auth token');
    }
  }
}
