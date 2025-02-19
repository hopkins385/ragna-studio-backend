import { CreditModule } from './../credit/credit.module';
import { Module } from '@nestjs/common';
import { ChatStreamService } from './chat-stream.service';
import { SocketModule } from '@/modules/socket/socket.module';
import { ChatStreamController } from './chat-stream.controller';
import { ChatModule } from '@/modules/chat/chat.module';
import { ChatStreamEventListener } from './listeners/chat-stream-event.listener';
import { AssistantToolFunctionModule } from '../assistant-tool-function/assistant-tool-function.module';

@Module({
  imports: [
    CreditModule,
    SocketModule,
    ChatModule,
    AssistantToolFunctionModule,
  ],
  providers: [ChatStreamService, ChatStreamEventListener],
  controllers: [ChatStreamController],
})
export class ChatStreamModule {}
