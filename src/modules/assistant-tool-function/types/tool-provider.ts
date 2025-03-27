import type { ZodObject, ZodType } from 'zod';
import { ToolContext, ToolOptions } from '../interfaces/assistant-tool-function.interface';
import { ChatEventEmitter } from '@/modules/chat/events/chat-event.emitter';
import { ChatToolCallEventDto } from '@/modules/chat/events/chat-tool-call.event';

export interface ToolMetadata {
  name: string;
  description: string;
}

export abstract class ToolProvider<TArgs extends Record<string, any> = any, TResponse = any> {
  private name: string;
  private description: string;
  private parameters: ZodType<any>;

  constructor(metadata: ToolMetadata & { parameters: ZodObject<any> }) {
    this.name = metadata.name;
    this.description = metadata.description;
    this.parameters = metadata.parameters;
  }

  public abstract execute(
    args: TArgs,
    context: ToolContext,
    options?: ToolOptions,
  ): Promise<TResponse>;

  public updateMetadata(metadata: ToolMetadata & { parameters: ZodObject<any> }) {
    this.description = metadata.description;
    this.name = metadata.name;
    this.parameters = metadata.parameters;
  }

  public getMetadata() {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
    };
  }

  emitToolStartCallEvent(
    chatEventEmitter: ChatEventEmitter,
    payload: { userId: string; chatId: string; toolInfo: string },
  ) {
    const meta = this.getMetadata();
    const event = ChatToolCallEventDto.fromInput({
      userId: payload.userId,
      chatId: payload.chatId,
      toolName: meta.name,
      toolInfo: payload.toolInfo,
    });
    chatEventEmitter.emitToolStartCall(event);
  }
}
