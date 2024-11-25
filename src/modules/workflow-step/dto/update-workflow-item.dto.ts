export class UpdateWorkflowItemDto {
  readonly workflowStepId: string;
  readonly itemId: string;
  readonly itemContent: string;

  constructor(workflowStepId: string, itemId: string, itemContent: string) {
    this.workflowStepId = workflowStepId;
    this.itemId = itemId;
    this.itemContent = itemContent;
  }

  static fromInput(data: {
    workflowStepId: string;
    itemId: string;
    itemContent: string;
  }) {
    return new UpdateWorkflowItemDto(
      data.workflowStepId,
      data.itemId,
      data.itemContent,
    );
  }
}
