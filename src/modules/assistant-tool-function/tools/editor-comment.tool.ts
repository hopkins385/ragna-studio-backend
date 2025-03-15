import { Injectable, Logger } from '@nestjs/common';
import { ToolProvider } from '../types/tool-provider';
import { z } from 'zod';
import {
  ToolContext,
  ToolOptions,
} from '@/modules/assistant-tool-function/interfaces/assistant-tool-function.interface';
import { ChatEventEmitter } from '@/modules/chat/events/chat-event.emitter';
import { EditorCommandEventDto } from '@/modules/chat/events/editor-command.event';

const addCommentSchema = z.object({
  from: z.number().describe('Highlight text start position of the comment'),
  to: z
    .number()
    .describe('Highlight text end position of the comment which must be greater than from'),
  commentText: z.string().describe('The text content of the comment'),
});

interface EditorCommentToolParams {
  from: number;
  to: number;
  commentText: string;
}

interface EditorToolCallResponse {
  from: number;
  to: number;
  text: string;
}

@Injectable()
export class EditorCommentTool extends ToolProvider<
  EditorCommentToolParams,
  EditorToolCallResponse
> {
  private readonly logger = new Logger(EditorCommentTool.name);

  constructor(private readonly chatEvent: ChatEventEmitter) {
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
    // simulate api call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const addCommentArgs = {
      from: params.from,
      to: params.to,
      text: params.commentText,
    };

    const eventData = EditorCommandEventDto.fromInput({
      userId: context.userId,
      documentId: context.documentId ?? '1234567890',
      command: 'addComment',
      args: addCommentArgs,
    });

    this.chatEvent.emitEditorCommandCall(eventData);

    return addCommentArgs;
  }
}
