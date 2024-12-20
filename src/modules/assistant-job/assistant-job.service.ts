import { WorkflowExecutionEventDto } from '@/modules/workflow-execution/dto/workflow-execution-event.dto';
import { Injectable, Logger } from '@nestjs/common';
import {
  CoreAssistantMessage,
  CoreMessage,
  CoreSystemMessage,
  CoreToolMessage,
  CoreUserMessage,
  generateText,
  GenerateTextResult,
} from 'ai';
import { AiModelFactory } from '@/modules/ai-model/factories/ai-model.factory';
import { DocumentItemService } from '@/modules/document-item/document-item.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssistantJobDto } from './dto/assistant-job.dto';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { WorkflowEvent } from '@/modules/workflow/enums/workflow-event.enum';
import { DocumentProcessingStatus } from '@/modules/document-item/interfaces/processing-status.interface';
import { ChatToolService } from '../chat-tool/chat-tool.service';

@Injectable()
export class AssistantJobService {
  private readonly logger = new Logger(AssistantJobService.name);

  constructor(
    private readonly event: EventEmitter2,
    private readonly configService: ConfigService,
    private readonly documentItemService: DocumentItemService,
    private readonly chatToolService: ChatToolService,
  ) {}

  async processWorkflowJob(payload: AssistantJobDto) {
    this.logger.debug('Processing workflow job', payload);

    const documentItem = await this.documentItemService.findFirst(
      payload.documentItemId,
    );

    if (!documentItem) {
      this.logger.error(`Document item not found: ${payload.documentItemId}`);
      throw new Error(`Document item not found: ${payload.documentItemId}`);
    }

    // skip if no input document items
    if (
      !payload.inputDocumentItemIds ||
      payload.inputDocumentItemIds.length < 1
    ) {
      return true;
    }

    // get input document items
    const inputDocumentItems = await this.documentItemService.findManyItems(
      payload.inputDocumentItemIds,
    );

    if (!inputDocumentItems || inputDocumentItems.length < 1) {
      this.logger.error(
        `Input document items not found: ${payload.inputDocumentItemIds}`,
      );
      throw new Error(
        `Input document items not found: ${payload.inputDocumentItemIds}`,
      );
    }

    // Sort by orderColumn and join content
    const content = inputDocumentItems
      .sort((a, b) => {
        const orderA = a.document.workflowSteps[0].orderColumn;
        const orderB = b.document.workflowSteps[0].orderColumn;
        return orderA - orderB;
      })
      .map((item) => {
        return `# ${item.document.workflowSteps[0].name}\n${item.content}`;
      })
      .join('\n');

    const initialMessages: CoreMessage[] = [
      {
        role: 'system',
        content: payload.systemPrompt,
      },
      {
        role: 'user',
        content: content,
      },
    ];

    const aiModelFactory = new AiModelFactory(this.configService);
    const model = aiModelFactory
      .setConfig({
        provider: payload.llmProvider as any, // TODO: fix typing
        model: payload.llmNameApi,
      })
      .getModel();

    const availableTools = this.chatToolService.getTools({
      llmName: payload.llmNameApi,
      llmProvider: payload.llmProvider,
      functionIds: payload.functionIds,
      emitToolInfoData: (data) => {},
    });

    const {
      text: initialText,
      steps,
      finishReason,
      toolCalls,
      toolResults,
    } = await generateText({
      model,
      maxTokens: payload.maxTokens,
      temperature: payload.temperature,
      messages: initialMessages,
      tools: availableTools,
      maxSteps: 1,
    });

    // make again a call
    switch (finishReason) {
      case 'tool-calls':
        // TODO: make this optional from UI to include the initial text in cases of tool calls
        // if (text.length > 0) {
        //   initialMessages.push({
        //     role: 'assistant',
        //     content: text,
        //   });
        // }

        // TODO: remove this workaround
        // workaround: add type to toolResults
        // https://github.com/vercel/ai/issues/4165
        const newToolResults = toolResults.map((toolResult) => {
          if (!toolResult.type) {
            return {
              ...toolResult,
              type: 'tool-result',
            };
          }
          return toolResult;
        });

        const toolMessages: CoreMessage[] = [
          { role: 'assistant', content: toolCalls },
          { role: 'tool', content: newToolResults as any },
        ];

        const text = await this.handleToolCall({
          model,
          availableTools,
          initialMessages,
          toolMessages,
          payload,
        });

        initialMessages.push({
          role: 'assistant',
          content: text,
        });
        break;
      case 'stop':
      case 'length':
        initialMessages.push({
          role: 'assistant',
          content: initialText,
        });
        break;
    }

    const update = await this.documentItemService.update({
      documentItemId: payload.documentItemId,
      content: initialMessages
        .map((m) => {
          if (m.role === 'assistant') {
            return m.content;
          }
          return '';
        })
        .join('\n')
        .trim(),
      status: 'completed',
    });

    /*this.event.emit(WorkflowEvent.PROGRESS, {
      userId,
      workflowId: payload.workflowId,
      progress: this.getProgress(payload),
    });*/

    /*
    this.event.emit(
      UsageEvent.TRACKTOKENS,
      TrackTokensDto.fromInput({
        userId,
        llm: {
          provider: llmProvider,
          model: llmNameApi,
        },
        usage: {
          promptTokens: usage.promptTokens || -1,
          completionTokens: usage.completionTokens || -1,
          totalTokens: usage.totalTokens || -1,
        },
      }),
    );

    const updateCreditsData = {
      userId,
      credits: 1,
    } satisfies IUpdateCreditsEvent;

    this.event.emit(UsageEvent.UPDATE_CREDITS, updateCreditsData);
    */
  }

  async updateWorkflowJobStatus(
    data: Job<AssistantJobDto>['data'],
    status: DocumentProcessingStatus,
  ) {
    const { userId, documentItemId, workflowId } = data;
    await this.documentItemService.updateProcessingStatus(
      documentItemId,
      status,
    );

    const workflowExecutionEventData = WorkflowExecutionEventDto.fromInput({
      userId,
      workflowId,
    });

    switch (status) {
      case 'pending':
        this.event.emit(WorkflowEvent.CELL_ACTIVE, workflowExecutionEventData);
        break;
      case 'failed':
      case 'completed':
        this.event.emit(
          WorkflowEvent.CELL_COMPLETED,
          workflowExecutionEventData,
        );
        break;
      default:
        this.logger.error(`Invalid job status: ${status}`);
        break;
    }
  }

  private getProgress({
    stepIndex,
    totalStepCount,
    rowIndex,
    totalRowCount,
  }: AssistantJobDto) {
    const totalCells = totalStepCount * totalRowCount;
    const completedCells = rowIndex * totalStepCount + stepIndex + 1;
    const progressPercentage = (completedCells / totalCells) * 100;

    return Math.min(Math.floor(progressPercentage), 100);
  }

  async handleToolCall({
    model,
    availableTools,
    initialMessages,
    toolMessages,
    payload,
  }: {
    model: any;
    availableTools: any;
    initialMessages: CoreMessage[];
    toolMessages: CoreMessage[];
    payload: AssistantJobDto;
  }) {
    this.logger.debug('Making a follow-up call');

    const followUpMessages: CoreMessage[] = [
      ...initialMessages,
      ...toolMessages,
    ];

    this.logger.debug('Follow-up messages', followUpMessages);

    try {
      const { text: text2, steps: steps2 } = await generateText({
        model,
        maxTokens: payload.maxTokens,
        temperature: payload.temperature,
        messages: followUpMessages,
        tools: availableTools,
        maxSteps: 1,
      });

      return text2;
    } catch (error: any) {
      throw error;
    }
  }
}
