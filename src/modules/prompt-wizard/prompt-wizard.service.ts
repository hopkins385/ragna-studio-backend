import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import { AiModelFactory } from '@/modules/ai-model/factories/ai-model.factory';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoreMessage, generateText } from 'ai';
import {
  basicPromptImprovementTemplate,
  finalzingPromptTemplate,
  systemPromptTemplate,
} from './constants/prompt-templates';

@Injectable()
export class PromptWizardService {
  private readonly logger = new Logger(PromptWizardService.name);

  constructor(private readonly configService: ConfigService) {}

  async createPrompt(payload: any) {
    try {
      const critiqueResult = await this.critiquePromptAgent(payload);
      // const refineResult = await this.refinePromptAgent({ input: critiqueResult });
      const finalazingResult = await this.finalzingPromptAgent({
        inputPrompt: payload.input,
        critique: critiqueResult,
      });
      return finalazingResult;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Failed to create prompt: ${error.message}`);
      }
      throw error;
    }
  }

  private async critiquePromptAgent(payload: { input: string }) {
    const modelFactory = new AiModelFactory(this.configService).setConfig({
      provider: ProviderType.OPENAI,
      model: 'o3',
    });

    let userContent = basicPromptImprovementTemplate
      .replace('{inputPrompt}', payload.input)
      .replace('{critique}', 'We can do better');

    // add current time to the user content
    const currentTime = new Date().toLocaleTimeString();
    userContent += `\n\nCurrent time is: ${currentTime}`;

    const messages: CoreMessage[] = [
      { role: 'system', content: systemPromptTemplate },
      { role: 'user', content: userContent },
    ];

    const { text } = await generateText({
      // abortSignal: signal,
      model: modelFactory.getModel(),
      messages,
      maxSteps: 1,
      maxRetries: 1,
    });

    return text;
  }

  private async finalzingPromptAgent(payload: { inputPrompt: string; critique: string }) {
    const modelFactory = new AiModelFactory(this.configService).setConfig({
      provider: ProviderType.OPENAI,
      model: 'gpt-4.1-mini',
    });

    let userContent = finalzingPromptTemplate
      .replace('{inputPrompt}', payload.inputPrompt)
      .replace('{critique}', payload.critique);

    // add current time to the user content
    const currentTime = new Date().toLocaleTimeString();
    userContent += `\n\nCurrent time is: ${currentTime}`;

    const messages: CoreMessage[] = [
      { role: 'system', content: systemPromptTemplate },
      { role: 'user', content: userContent },
    ];

    const { text } = await generateText({
      // abortSignal: signal,
      model: modelFactory.getModel(),
      messages,
      maxSteps: 1,
      maxRetries: 3,
    });

    return text;
  }

  private async refinePromptAgent(payload: { input: string }) {
    const modelFactory = new AiModelFactory(this.configService).setConfig({
      provider: ProviderType.OPENAI,
      model: 'gpt-4.1-mini',
    });

    let userContent = basicPromptImprovementTemplate
      .replace('{inputPrompt}', payload.input)
      .replace('{critique}', 'We can do better');

    // add current time to the user content
    const currentTime = new Date().toLocaleTimeString();
    userContent += `\n\nCurrent time is: ${currentTime}`;

    const messages: CoreMessage[] = [
      { role: 'system', content: systemPromptTemplate },
      { role: 'user', content: userContent },
    ];

    const { text } = await generateText({
      // abortSignal: signal,
      model: modelFactory.getModel(),
      messages,
      maxSteps: 1,
      maxRetries: 3,
    });

    return text;
  }
}
