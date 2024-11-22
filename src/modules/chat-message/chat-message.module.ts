import { Module } from '@nestjs/common';
import { ChatMessageController } from './chat-message.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [ChatMessageController],
})
export class ChatMessageModule {}
