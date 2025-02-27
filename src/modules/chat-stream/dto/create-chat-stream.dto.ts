import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import type { CoreMessage } from 'ai';

export class CreateChatStreamDto {
  provider: ProviderType;
  model: string;
  systemPrompt: string;
  messages: CoreMessage[];
  functionIds: number[];
  maxTokens: number;
  temperature: number;
  reasoningEffort?: number;

  constructor(
    provider: ProviderType,
    model: string,
    systemPrompt: string,
    messages: CoreMessage[],
    functionIds: number[],
    maxTokens: number,
    temperature: number,
    reasoningEffort?: number,
  ) {
    this.provider = provider;
    this.model = model;
    this.systemPrompt = systemPrompt;
    this.messages = messages;
    this.functionIds = functionIds;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
    this.reasoningEffort = reasoningEffort;
  }

  static fromInput(input: any): CreateChatStreamDto {
    return new CreateChatStreamDto(
      input.provider,
      input.model,
      input.systemPrompt,
      input.messages,
      input.functionIds,
      input.maxTokens,
      input.temperature,
      input.reasoningEffort,
    );
  }
}
