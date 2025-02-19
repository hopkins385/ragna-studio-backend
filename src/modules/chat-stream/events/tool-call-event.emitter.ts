// chat-stream-event.emitter.ts
import { ChatEvent } from '@/modules/chat/enums/chat-event.enum';
import { ChatToolCallEventDto } from '@/modules/chat/events/chat-tool-call.event';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatToolCallEventEmitter {
  constructor(private eventEmitter: EventEmitter2) {}

  emitToolEndCall(payload: ChatToolCallEventDto) {
    this.eventEmitter.emit(ChatEvent.TOOL_END_CALL, payload);
  }

  emitToolStartCall(payload: ChatToolCallEventDto) {
    this.eventEmitter.emit(ChatEvent.TOOL_START_CALL, payload);
  }
}
