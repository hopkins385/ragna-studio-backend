import { ChatRepository } from './repositories/chat.repository';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SocketModule } from '@/modules/socket/socket.module';
import { AssistantModule } from '../assistant/assistant.module';
import { TokenizerService } from '../tokenizer/tokenizer.service';
import { ChatEventListener } from './listeners/chat-event.listener';
import { ChatEventEmitter } from './events/chat-event.emitter';

@Module({
  imports: [SocketModule, AssistantModule],
  controllers: [ChatController],
  providers: [
    ChatEventEmitter,
    ChatEventListener,
    ChatRepository,
    ChatService,
    TokenizerService,
  ],
  exports: [ChatEventEmitter, ChatEventListener, ChatService],
})
export class ChatModule {}
