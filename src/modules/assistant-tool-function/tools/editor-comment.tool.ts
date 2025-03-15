import { Injectable, Logger } from '@nestjs/common';
import { ToolProvider } from '../types/tool-provider';
import { z } from 'zod';
import {
  ToolContext,
  ToolOptions,
} from '@/modules/assistant-tool-function/interfaces/assistant-tool-function.interface';
import { ChatEventEmitter } from '@/modules/chat/events/chat-event.emitter';
import { EditorCommandEventDto } from '@/modules/chat/events/editor-command.event';
import { ChatToolCallEventDto } from '@/modules/chat/events/chat-tool-call.event';

const addCommentSchema = z.object({
  from: z.number().describe('Highlight text start position of the comment'),
  to: z
    .number()
    .describe('Highlight text end position of the comment which must be greater than from'),
  text: z.string().describe('Comment text'),
});

interface EditorCommentToolParams {
  from: number;
  to: number;
  text: string;
}

interface EditorCommentToolResponse {
  from: number;
  to: number;
  text: string;
}

@Injectable()
export class EditorCommentTool extends ToolProvider<
  EditorCommentToolParams,
  EditorCommentToolResponse
> {
  private readonly logger = new Logger(EditorCommentTool.name);

  constructor(private readonly chatEventEmitter: ChatEventEmitter) {
    super({
      name: 'comment',
      description: 'Comment on a specific part of the document',
      parameters: addCommentSchema,
    });
  }

  public async execute(
    params: EditorCommentToolParams,
    context: ToolContext,
    options?: ToolOptions,
  ) {
    // this.logger.debug(`Commenting on document: ${context.documentId}`);
    this.logger.debug(`Comment params: ${JSON.stringify(params)}`);

    // this.emitToolStartCallEvent(this.chatEventEmitter, {
    //   userId: context.userId,
    //   chatId: context.chatId,
    //   toolInfo: `${params.text}`,
    // });

    // simulate api call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const addCommentPayload = {
      from: params.from,
      to: params.to,
      text: params.text,
    };

    const eventData = EditorCommandEventDto.fromInput({
      userId: context.userId,
      documentId: '1234567890', //context.documentId,
      command: 'addComment',
      args: addCommentPayload,
    });

    this.logger.debug(`Emitting editor command event: ${JSON.stringify(eventData)}`);

    this.chatEventEmitter.emitEditorCommandCall(eventData);

    return addCommentPayload;
  }
}
