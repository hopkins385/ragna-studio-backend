export class ChatToolCallEventDto {
  readonly userId: string;
  readonly chatId: string;
  readonly toolName: string;
  readonly toolInfo?: string;

  constructor(
    userId: string,
    chatId: string,
    toolName: string,
    toolInfo?: string,
  ) {
    this.userId = userId;
    this.chatId = chatId;
    this.toolName = toolName;
    this.toolInfo = toolInfo;
  }

  static fromInput(input: {
    userId: string;
    chatId: string;
    toolName: string;
    toolInfo?: string;
  }): ChatToolCallEventDto {
    return new ChatToolCallEventDto(
      input.userId,
      input.chatId,
      input.toolName,
      input.toolInfo,
    );
  }
}
