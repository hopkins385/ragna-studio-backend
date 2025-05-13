import {
  ToolContext,
  ToolOptions,
} from '@/modules/assistant-tool-function/interfaces/assistant-tool-function.interface';
import { ChatEventEmitter } from '@/modules/chat/events/chat-event.emitter';
import { EditorCommandEventDto } from '@/modules/chat/events/editor-command.event';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { ToolProvider } from '../types/tool-provider';

const addCommentSchema = z.object({
  from: z.number().describe('Highlight text start position of the comment'),
  to: z
    .number()
    .describe('Highlight text end position of the comment which must be greater than from'),
  commentText: z.string().min(3).max(100000).describe('The text content of the comment'),
});

type EditorCommentToolArgs = z.infer<typeof addCommentSchema>;

interface EditorToolCallResponse {
  from: number;
  to: number;
  commentText: string;
}

@Injectable()
export class EditorCommentTool extends ToolProvider<EditorCommentToolArgs, EditorToolCallResponse> {
  private readonly logger = new Logger(EditorCommentTool.name);

  constructor(private readonly chatEvent: ChatEventEmitter) {
    super({
      name: 'comment',
      description: 'Comment on a specific part of the document',
      parameters: addCommentSchema,
    });
  }

  public async execute(args: EditorCommentToolArgs, context: ToolContext, options?: ToolOptions) {
    // simulate api call
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    const addCommentArgs = {
      from: args.from,
      to: args.to,
      commentText: args.commentText,
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
