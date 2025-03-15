export class EditorCommandEventDto {
  readonly userId: string;
  readonly documentId: string;
  readonly command: string;
  readonly args: any;

  constructor(userId: string, documentId: string, command: string, args: any) {
    this.userId = userId;
    this.documentId = documentId;
    this.command = command;
    this.args = args;
  }

  static fromInput(input: {
    userId: string;
    documentId: string;
    command: string;
    args: any;
  }): EditorCommandEventDto {
    return new EditorCommandEventDto(input.userId, input.documentId, input.command, input.args);
  }
}
