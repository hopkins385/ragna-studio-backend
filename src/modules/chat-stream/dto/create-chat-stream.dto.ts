import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import type { CoreMessage } from 'ai';

export class CreateChatStreamDto {
  provider: ProviderType;
  model: string;
  messages: CoreMessage[];
  functionIds: number[];
  maxTokens: number;
  temperature: number;

  constructor(
    provider: ProviderType,
    model: string,
    messages: CoreMessage[],
    functionIds: number[],
    maxTokens: number,
    temperature: number,
  ) {
    this.provider = provider;
    this.model = model;
    this.messages = messages;
    this.functionIds = functionIds;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  static fromInput(input: CreateChatStreamDto): CreateChatStreamDto {
    return new CreateChatStreamDto(
      input.provider,
      input.model,
      input.messages,
      input.functionIds,
      input.maxTokens,
      input.temperature,
    );
  }
}
