export class EditorCommandEventDto {
  readonly userId: string;
  readonly documentId: string;
  readonly command: string;
  readonly payload: any;

  constructor(userId: string, documentId: string, command: string, payload: any) {
    this.userId = userId;
    this.documentId = documentId;
    this.command = command;
    this.payload = payload;
  }

  static fromInput(input: {
    userId: string;
    documentId: string;
    command: string;
    payload: any;
  }): EditorCommandEventDto {
    return new EditorCommandEventDto(input.userId, input.documentId, input.command, input.payload);
  }
}
