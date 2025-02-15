import { ChatRepository } from './repositories/chat.repository';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SocketModule } from '@/modules/socket/socket.module';
import { ChatToolService } from '../chat-tool/chat-tool.service';
import { AssistantModule } from '../assistant/assistant.module';
import { TokenizerService } from '../tokenizer/tokenizer.service';
import { CollectionModule } from '../collection/collection.module';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [SocketModule, AssistantModule, CollectionModule, EmbeddingModule],
  controllers: [ChatController],
  providers: [ChatRepository, ChatService, ChatToolService, TokenizerService],
  exports: [ChatService],
})
export class ChatModule {}
