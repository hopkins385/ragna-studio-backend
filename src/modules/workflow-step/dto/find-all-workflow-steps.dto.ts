export class FindAllWorkflowStepsDto {
  readonly workflowId: string;

  constructor(workflowId: string) {
    this.workflowId = workflowId.toLowerCase();
  }

  static fromInput(input: { workflowId: string }): FindAllWorkflowStepsDto {
    return new FindAllWorkflowStepsDto(input.workflowId);
  }
}
