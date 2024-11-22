export class FirstUserMessageEventDto {
  readonly chatId: string;
  readonly userId: string;
  readonly messageContent: string;

  constructor(chatId: string, userId: string, messageContent: string) {
    this.chatId = chatId.toLowerCase();
    this.userId = userId.toLowerCase();
    this.messageContent = messageContent;
  }

  static fromInput(input: {
    chatId: string;
    userId: string;
    messageContent: string;
  }): FirstUserMessageEventDto {
    return new FirstUserMessageEventDto(
      input.chatId,
      input.userId,
      input.messageContent,
    );
  }
}
