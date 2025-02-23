import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AiModelFactory } from '@/modules/ai-model/factories/ai-model.factory';
import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import { CoreMessage, generateText } from 'ai';
import TurndownService from 'turndown';
import { ConfigService } from '@nestjs/config';
import { TokenUsageEventEmitter } from '@/modules/token-usage/events/token-usage-event.emitter';
import { TokenUsageEventDto } from '@/modules/token-usage/events/token-usage-event.dto';
import { LlmService } from '@/modules/llm/llm.service';
import { EditorCompletionDto } from '@/modules/editor/dto/editor-completion.dto';
import { EditorSystemPrompt } from '@/modules/editor/constants/editor-system-prompt';
import { EditorUserPrompt } from '@/modules/editor/constants/editor-user-prompt';

@Injectable()
export class EditorService {
  private readonly logger = new Logger(EditorService.name);
  private readonly turndownService = new TurndownService({
    headingStyle: 'atx',
  });

  constructor(
    private readonly configService: ConfigService,
    private readonly llmService: LlmService,
    private readonly tokenUsageEvent: TokenUsageEventEmitter,
  ) {}

  private logError(error: unknown): void {
    if (error instanceof Error) {
      this.logger.error(`Error: ${error.message}`, error.stack);
    } else {
      this.logger.error(error);
    }
  }

  private htmlToMarkdown(html: string): string {
    return this.turndownService.turndown(html);
  }

  private async getLargeLangModel() {
    try {
      const llmApiName = 'gpt-4o-mini';
      const model = await this.llmService.getModelByApiName({
        apiName: llmApiName,
      });
      return model;
    } catch (error) {
      this.logError(error);
      return null;
    }
  }

  private createMessages(systemPrompt: string, userContent: string): CoreMessage[] {
    return [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userContent,
      },
    ];
  }

  private async generateCompletionText(payload: {
    editorCompletionDto: EditorCompletionDto;
    llmId: string;
    llmApiName: string;
    messages: CoreMessage[];
  }): Promise<{ text: string }> {
    const { editorCompletionDto, llmId } = payload;
    const modelFactory = new AiModelFactory(this.configService);
    const aiModelFactory = modelFactory.setConfig({
      provider: ProviderType.OPENAI,
      model: payload.llmApiName,
    });
    const { text, usage } = await generateText({
      model: aiModelFactory.getModel(),
      messages: payload.messages,
      maxSteps: 1,
      maxRetries: 3,
    });

    this.emitTokenUsage({ editorCompletionDto, llmId, usage });

    return { text };
  }

  private emitTokenUsage(payload: {
    editorCompletionDto: EditorCompletionDto;
    llmId: string;
    usage: any;
  }): void {
    const tokenUsageEventDto = TokenUsageEventDto.fromInput({
      userId: payload.editorCompletionDto.userId,
      modelId: payload.llmId,
      tokens: {
        prompt: payload.usage.completionTokens,
        completion: payload.usage.completionTokens,
        reasoning: 0,
        total: payload.usage.completionTokens,
      },
    });

    this.tokenUsageEvent.emitTokenUsage(tokenUsageEventDto);
  }

  public async completion(
    editorCompletionDto: EditorCompletionDto,
  ): Promise<{ completion: string }> {
    const llm = await this.getLargeLangModel();

    if (!llm) {
      throw new NotFoundException('LLM not found');
    }

    const markdownContext = this.htmlToMarkdown(editorCompletionDto.context);
    const systemPrompt = EditorSystemPrompt.setContext(markdownContext).getPrompt();
    const userContent = EditorUserPrompt.setInstructions(editorCompletionDto.instructions)
      .setSelectedText(editorCompletionDto.selectedText)
      .getPrompt();

    const messages = this.createMessages(systemPrompt, userContent);

    try {
      const { text } = await this.generateCompletionText({
        editorCompletionDto,
        llmId: llm.id,
        llmApiName: llm.apiName,
        messages,
      });
      //
      return { completion: text };
      //
    } catch (error) {
      this.logError(error);
      throw new InternalServerErrorException('Error generating text');
    }
  }
}
