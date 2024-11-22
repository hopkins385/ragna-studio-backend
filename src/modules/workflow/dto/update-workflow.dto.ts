export class UpdateWorkflowDto {
  readonly workflowId: string;
  readonly name: string;
  readonly description: string;

  constructor(workflowId: string, name: string, description: string) {
    this.workflowId = workflowId.toLowerCase();
    this.name = name;
    this.description = description;
  }

  static fromInput(input: {
    workflowId: string;
    name: string;
    description: string;
  }): UpdateWorkflowDto {
    return new UpdateWorkflowDto(
      input.workflowId,
      input.name,
      input.description,
    );
  }
}
