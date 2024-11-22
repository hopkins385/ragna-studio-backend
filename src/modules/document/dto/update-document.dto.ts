export class UpdateDocumentDto {
  readonly documentId: string;
  readonly name: string;
  readonly description: string;
  readonly status: string;

  constructor(
    documentId: string,
    name: string,
    description: string,
    status: string,
  ) {
    this.documentId = documentId;
    this.name = name;
    this.description = description;
    this.status = status;
  }

  static fromInput(input: {
    documentId: string;
    name: string;
    description: string;
    status: string;
  }): UpdateDocumentDto {
    return new UpdateDocumentDto(
      input.documentId,
      input.name,
      input.description,
      input.status,
    );
  }
}
