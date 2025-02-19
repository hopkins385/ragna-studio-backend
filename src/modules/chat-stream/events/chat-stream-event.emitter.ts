// chat-stream-event.emitter.ts
import { ChatEvent } from '@/modules/chat/enums/chat-event.enum';
import { FirstUserMessageEventDto } from '@/modules/chat/events/first-user-message.event';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatStreamEventEmitter {
  constructor(private eventEmitter: EventEmitter2) {}

  emitIsFirstChatMessage(payload: FirstUserMessageEventDto) {
    this.eventEmitter.emit(ChatEvent.FIRST_USERMESSAGE, payload);
  }
}
