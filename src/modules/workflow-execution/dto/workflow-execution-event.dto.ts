export class WorkflowExecutionEventDto {
  userId: string;
  workflowId: string;

  constructor(userId: string, workflowId: string) {
    this.userId = userId;
    this.workflowId = workflowId;
  }

  static fromInput(input: any) {
    return new WorkflowExecutionEventDto(input.userId, input.workflowId);
  }
}
