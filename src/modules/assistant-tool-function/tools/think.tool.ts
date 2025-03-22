import { AssistantToolService } from './../../assistant-tool/assistant-tool.service';
import { Injectable, Logger } from '@nestjs/common';
import { ToolProvider } from '../types/tool-provider';
import { z } from 'zod';
import {
  ToolContext,
  ToolOptions,
} from '@/modules/assistant-tool-function/interfaces/assistant-tool-function.interface';
import { ChatEventEmitter } from '@/modules/chat/events/chat-event.emitter';
import { CreateToolCallDto } from '@/modules/assistant-tool/dto/create-tool-call.dto';

const thinkToolSchema = z.object({
  thought: z.string().describe('Your thoughts.'),
});

type ThinkToolParams = z.infer<typeof thinkToolSchema>;

interface ThinkToolCallResponse {
  thought: string;
}

@Injectable()
export class ThinkTool extends ToolProvider<ThinkToolParams, ThinkToolCallResponse> {
  private readonly logger = new Logger(ThinkTool.name);

  constructor(
    private readonly assistantToolService: AssistantToolService,
    private readonly chatEvent: ChatEventEmitter,
  ) {
    super({
      name: 'think',
      description:
        'Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or brainstorming is needed.',
      parameters: thinkToolSchema,
    });
  }

  public async execute(params: ThinkToolParams, context: ToolContext, options?: ToolOptions) {
    this.emitToolStartCallEvent(this.chatEvent, {
      userId: context.userId,
      chatId: context.chatId,
      toolInfo: `${params?.thought}`,
    });
    // simulate api call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Log the tool call
    const toolCallPayload = CreateToolCallDto.fromInput({
      assistantId: context.assistantId,
      toolId: context.toolId,
      // input is equal to output, so we just pass the params to output
      input: undefined,
      output: params,
    });

    // save the tool call to the database
    await this.assistantToolService.createToolCall(toolCallPayload);

    //
    return {
      thought: params.thought,
    };
  }
}
