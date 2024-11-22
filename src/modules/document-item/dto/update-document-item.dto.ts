export class UpdateDocumentItemDto {
  readonly documentItemId: string;
  readonly content: string;
  readonly orderColumn?: number;
  readonly status?: string;
  readonly type?: string;

  constructor(
    documentItemId: string,
    content: string | number | undefined,
    orderColumn?: number,
    status?: string,
    type?: string,
  ) {
    this.documentItemId = documentItemId.toLowerCase();
    this.orderColumn = orderColumn;
    this.status = status;
    this.type = type;
    this.content = content?.toString() || '';
  }

  static fromInput(input: {
    documentItemId: string;
    content: string | number | undefined;
    orderColumn?: number;
    status?: string;
    type?: string;
  }): UpdateDocumentItemDto {
    return new UpdateDocumentItemDto(
      input.documentItemId,
      input.content,
      input.orderColumn,
      input.status,
      input.type,
    );
  }
}
