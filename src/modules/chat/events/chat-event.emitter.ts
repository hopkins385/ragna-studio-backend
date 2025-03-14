// chat-event.emitter.ts
import { ChatEvent } from '@/modules/chat/enums/chat-event.enum';
import { ChatToolCallEventDto } from '@/modules/chat/events/chat-tool-call.event';
import { EditorCommandEventDto } from '@/modules/chat/events/editor-command.event';
import { FirstUserMessageEventDto } from '@/modules/chat/events/first-user-message.event';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatEventEmitter {
  constructor(private eventEmitter: EventEmitter2) {}

  public emitIsFirstChatMessage(payload: FirstUserMessageEventDto) {
    this.eventEmitter.emit(ChatEvent.FIRST_USERMESSAGE, payload);
  }

  public emitToolStartCall(payload: ChatToolCallEventDto) {
    this.eventEmitter.emit(ChatEvent.TOOL_START_CALL, payload);
  }

  public emitToolEndCall(payload: ChatToolCallEventDto) {
    this.eventEmitter.emit(ChatEvent.TOOL_END_CALL, payload);
  }

  public emitEditorCommandCall(payload: EditorCommandEventDto) {
    this.eventEmitter.emit(ChatEvent.EDITOR_COMMAND_CALL, payload);
  }
}
