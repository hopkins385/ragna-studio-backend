import { ChatRepository } from './repositories/chat.repository';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SocketModule } from '@/modules/socket/socket.module';
import { AssistantModule } from '../assistant/assistant.module';
import { TokenizerService } from '../tokenizer/tokenizer.service';

@Module({
  imports: [SocketModule, AssistantModule],
  controllers: [ChatController],
  providers: [ChatRepository, ChatService, TokenizerService],
  exports: [ChatService],
})
export class ChatModule {}
