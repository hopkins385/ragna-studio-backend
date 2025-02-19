import { CreditModule } from './../credit/credit.module';
import { Module } from '@nestjs/common';
import { ChatStreamService } from './chat-stream.service';
import { SocketModule } from '@/modules/socket/socket.module';
import { ChatStreamController } from './chat-stream.controller';
import { ChatModule } from '@/modules/chat/chat.module';
import { AssistantToolFunctionModule } from '../assistant-tool-function/assistant-tool-function.module';
import { TokenUsageModule } from '../token-usage/token-usage.module';

@Module({
  imports: [
    TokenUsageModule,
    SocketModule,
    ChatModule,
    AssistantToolFunctionModule,
  ],
  providers: [ChatStreamService],
  controllers: [ChatStreamController],
})
export class ChatStreamModule {}
