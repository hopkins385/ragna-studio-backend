import { ProviderType } from '@/modules/ai-model/enums/provider.enum';
import type { CoreMessage } from 'ai';

export class CreateChatStreamIniDto {
  provider: ProviderType;
  model: string;
  messages: CoreMessage[];
  functionIds: string[];

  static fromInput(input: CreateChatStreamIniDto): CreateChatStreamIniDto {
    const dto = new CreateChatStreamIniDto();
    dto.provider = input.provider;
    dto.model = input.model;
    dto.messages = input.messages;
    dto.functionIds = input.functionIds;
    return dto;
  }
}
