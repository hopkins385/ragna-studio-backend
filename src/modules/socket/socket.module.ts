import { Module } from '@nestjs/common';
import { SocketController } from './socket.controller';
import { JwtService } from '@nestjs/jwt';
import { SocketService } from './socket.service';

@Module({
  controllers: [SocketController],
  providers: [JwtService, SocketService],
  exports: [SocketService],
})
export class SocketModule {}
