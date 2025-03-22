import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import { Tool } from '@prisma/client';
import type { CoreMessage } from 'ai';

export class CreateChatStreamDto {
  provider: ProviderType;
  model: string;
  systemPrompt: string;
  messages: CoreMessage[];
  maxTokens: number;
  temperature: number;
  reasoningEffort?: number;
  context?: string;

  constructor(
    provider: ProviderType,
    model: string,
    systemPrompt: string,
    messages: CoreMessage[],
    maxTokens: number,
    temperature: number,
    reasoningEffort?: number,
    context?: string,
  ) {
    this.provider = provider;
    this.model = model;
    this.systemPrompt = systemPrompt;
    this.messages = messages;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
    this.reasoningEffort = reasoningEffort;
    this.context = context;
  }

  static fromInput(input: {
    provider: ProviderType;
    model: string;
    systemPrompt: string;
    messages: any[];
    maxTokens: number;
    temperature: number;
    reasoningEffort?: number;
    context?: string;
  }): CreateChatStreamDto {
    return new CreateChatStreamDto(
      input.provider,
      input.model,
      input.systemPrompt,
      input.messages,
      input.maxTokens,
      input.temperature,
      input.reasoningEffort,
      input.context,
    );
  }
}
