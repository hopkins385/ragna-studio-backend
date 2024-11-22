import { AiModelFactory } from '@/modules/ai-model/factories/ai-model.factory';
import { Module } from '@nestjs/common';
import { ChatStreamService } from './chat-stream.service';
import { SocketModule } from '../socket/socket.module';
import { ChatStreamController } from './chat-stream.controller';
import { ChatModule } from '../chat/chat.module';
import { ChatToolService } from '../chat-tool/chat-tool.service';
import { ChatStreamEventListener } from './listeners/chat-stream-event.listener';

@Module({
  imports: [SocketModule, ChatModule],
  providers: [
    AiModelFactory,
    ChatStreamService,
    ChatToolService,
    ChatStreamEventListener,
  ],
  controllers: [ChatStreamController],
})
export class ChatStreamModule {}
