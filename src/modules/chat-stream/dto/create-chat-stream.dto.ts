import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import type { CoreMessage } from 'ai';

export class CreateChatStreamDto {
  provider: ProviderType;
  model: string;
  messages: CoreMessage[];
  functionIds: number[];

  static fromInput(input: CreateChatStreamDto): CreateChatStreamDto {
    const dto = new CreateChatStreamDto();
    dto.provider = input.provider;
    dto.model = input.model;
    dto.messages = input.messages;
    dto.functionIds = input.functionIds;
    return dto;
  }
}
