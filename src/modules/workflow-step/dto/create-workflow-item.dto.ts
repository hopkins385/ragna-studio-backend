export class CreateWorkflowItemDto {
  readonly documentId: string;
  readonly content: string;
  readonly orderColumn: number;
  readonly type: string;
  readonly status: string;

  constructor(data: CreateWorkflowItemDto) {
    this.documentId = data.documentId;
    this.content = data.content;
    this.orderColumn = data.orderColumn;
    this.type = data.type;
    this.status = data.status;
  }

  static fromInput(data: CreateWorkflowItemDto) {
    return new CreateWorkflowItemDto(data);
  }
}
