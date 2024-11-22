import { Module } from '@nestjs/common';
import { ChatToolService } from './chat-tool.service';

@Module({
  providers: [ChatToolService]
})
export class ChatToolModule {}
