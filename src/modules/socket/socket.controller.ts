import { SocketService } from './socket.service';
import { Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { UserEntity } from '@/modules/user/entities/user.entity';

@Controller('socket')
export class SocketController {
  constructor(private readonly socketService: SocketService) {}

  @Post('user-auth')
  async createAuthToken(@ReqUser() { id, roles }: UserEntity) {
    try {
      const token = await this.socketService.createAuthToken({
        userId: id,
        roles,
      });
      return { token };
    } catch (error) {
      throw new InternalServerErrorException('Error creating auth token');
    }
  }
}
