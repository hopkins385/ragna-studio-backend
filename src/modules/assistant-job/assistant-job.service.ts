import { Injectable, Logger } from '@nestjs/common';
import { CoreMessage, generateText } from 'ai';
import { AiModelFactory } from '../ai-model/factories/ai-model.factory';
import { DocumentItemService } from '../document-item/document-item.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssistantJobDto } from './dto/assistant-job.dto';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { WorkflowEvent } from '../workflow/enums/workflow-event.enum';
import { DocumentProcessingStatus } from '../document-item/interfaces/processing-status.interface';

@Injectable()
export class AssistantJobService {
  private readonly logger = new Logger(AssistantJobService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly documentItemService: DocumentItemService,
    private readonly event: EventEmitter2,
  ) {}

  async processWorkflowJob(payload: AssistantJobDto) {
    const aiModelFactory = new AiModelFactory(this.configService);
    const {
      stepName,
      userId,
      llmProvider,
      llmNameApi,
      temperature,
      maxTokens,
      assistantId,
      inputDocumentItemIds,
      documentItemId,
      systemPrompt,
    } = payload;

    const documentItem =
      await this.documentItemService.findFirst(documentItemId);
    if (!documentItem) {
      this.logger.error(`Document item not found: ${documentItemId}`);
      throw new Error(`Document item not found: ${documentItemId}`);
    }

    // skip if no input document items
    if (!inputDocumentItemIds || inputDocumentItemIds.length < 1) {
      return true;
    }

    // get input document items
    const inputDocumentItems =
      await this.documentItemService.findManyItems(inputDocumentItemIds);

    if (!inputDocumentItems || inputDocumentItems.length < 1) {
      this.logger.error(
        `Input document items not found: ${inputDocumentItemIds}`,
      );
      throw new Error(
        `Input document items not found: ${inputDocumentItemIds}`,
      );
    }

    if (inputDocumentItems.length === 1) {
      const inputDocumentItem = inputDocumentItems[0];
      const { content } = inputDocumentItem;
      // if content is an url, fetch the content
      /*
      if (content && content.length > 6 && content.startsWith('https://')) {
        // fetch content
        const url = new URL(content);
        const response = await scrapeWebsite(url);
        if (response) {
          // replace the content with scraped content
          inputDocumentItems[0].content = response
            ? JSON.stringify(response, null, 0)
            : '';
          // console.log('updated content', inputDocumentItems[0].content);
          // throw new Error('scraped');
          // json stringify the content without escaping
          // inputDocumentItems[0].content = JSON.stringify(response.result, null, 2);
        } else {
          throw new Error('Failed to get website content');
        }
      }
      */
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

    // console.log('content', JSON.stringify(content));
    // throw new Error('content');

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: content,
      },
    ] satisfies CoreMessage[];

    const model = aiModelFactory
      .setConfig({
        provider: llmProvider as any, // TODO: fix typing
        model: llmNameApi,
      })
      .getModel();

    const { text, usage } = await generateText({
      model,
      maxTokens: 1000,
      temperature,
      messages,
    });

    const update = await this.documentItemService.update({
      documentItemId,
      content: text || '',
      status: 'completed',
    });

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

    switch (status) {
      case 'pending':
        this.event.emit(WorkflowEvent.CELL_ACTIVE, { userId, workflowId });
        break;
      case 'failed':
      case 'completed':
        this.event.emit(WorkflowEvent.CELL_COMPLETED, { userId, workflowId });
        break;
      default:
        this.logger.error(`Invalid job status: ${status}`);
        break;
    }
  }
}
