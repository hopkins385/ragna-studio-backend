import { ChatRepository } from './repositories/chat.repository';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SocketModule } from '@/modules/socket/socket.module';
import { ChatToolService } from '../chat-tool/chat-tool.service';
import { AssistantModule } from '../assistant/assistant.module';
import { TokenizerService } from '../tokenizer/tokenizer.service';
import { AiModelFactory } from '../ai-model/factories/ai-model.factory';

@Module({
  imports: [SocketModule, AssistantModule],
  controllers: [ChatController],
  providers: [
    ChatRepository,
    ChatService,
    ChatToolService,
    TokenizerService,
    AiModelFactory,
  ],
  exports: [ChatService],
})
export class ChatModule {}
