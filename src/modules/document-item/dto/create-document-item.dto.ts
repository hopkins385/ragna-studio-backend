export class CreateDocumentItemDto {
  readonly documentId: string;
  readonly orderColumn: number;
  readonly status: string;
  readonly type: string;
  readonly content: string;

  constructor(
    documentId: string,
    orderColumn: number,
    status: string,
    type: string,
    content: string | number | undefined,
  ) {
    this.documentId = documentId.toLowerCase();
    this.orderColumn = orderColumn;
    this.status = status;
    this.type = type;
    this.content = content?.toString() || '';
  }

  static fromInput(input: {
    documentId: string;
    orderColumn: number;
    status: string;
    type: string;
    content: string | number | undefined;
  }): CreateDocumentItemDto {
    return new CreateDocumentItemDto(
      input.documentId,
      input.orderColumn,
      input.status,
      input.type,
      input.content,
    );
  }
}
