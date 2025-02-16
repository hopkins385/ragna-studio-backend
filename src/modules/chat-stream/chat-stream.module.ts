import { Module } from '@nestjs/common';
import { ChatStreamService } from './chat-stream.service';
import { SocketModule } from '@/modules/socket/socket.module';
import { ChatStreamController } from './chat-stream.controller';
import { ChatModule } from '@/modules/chat/chat.module';
import { ChatStreamEventListener } from './listeners/chat-stream-event.listener';
import { EmbeddingModule } from '@/modules/embedding/embedding.module';

@Module({
  imports: [SocketModule, ChatModule, EmbeddingModule],
  providers: [ChatStreamService, ChatStreamEventListener],
  controllers: [ChatStreamController],
})
export class ChatStreamModule {}
