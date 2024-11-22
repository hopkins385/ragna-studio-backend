export class StreamPayloadDto {
  userId: string;
  chatId: string;
  functionIds: number[];
  model: string;
  provider: string;
  messages: any[];
  systemPrompt: string;
  maxTokens: number;

  static fromInput(input: StreamPayloadDto): StreamPayloadDto {
    const dto = new StreamPayloadDto();
    dto.userId = input.userId;
    dto.chatId = input.chatId;
    dto.functionIds = input.functionIds;
    dto.model = input.model;
    dto.provider = input.provider;
    dto.messages = input.messages;
    dto.systemPrompt = input.systemPrompt;
    dto.maxTokens = input.maxTokens;
    return dto;
  }
}
