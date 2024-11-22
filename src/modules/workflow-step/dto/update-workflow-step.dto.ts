export class UpdateWorkflowStepDto {
  readonly workflowStepId: string;
  readonly name?: string;
  readonly description?: string;
  readonly orderColumn?: number;

  constructor(
    workflowStepId: string,
    name?: string,
    description?: string,
    orderColumn?: number,
  ) {
    this.workflowStepId = workflowStepId.toLowerCase();
    this.name = name?.toString() || undefined;
    this.description = description;
    this.orderColumn = orderColumn;
  }

  static fromInput(input: {
    workflowStepId: string;
    name?: string;
    description?: string;
    orderColumn?: number;
  }): UpdateWorkflowStepDto {
    return new UpdateWorkflowStepDto(
      input.workflowStepId,
      input.name,
      input.description,
      input.orderColumn,
    );
  }
}

export class UpdateWorkflowStepAssistantDto {
  readonly workflowStepId: string;
  readonly assistantId: string;

  constructor(workflowStepId: string, assistantId: string) {
    this.workflowStepId = workflowStepId.toLowerCase();
    this.assistantId = assistantId.toLowerCase();
  }

  static fromInput(input: {
    workflowStepId: string;
    assistantId: string;
  }): UpdateWorkflowStepAssistantDto {
    return new UpdateWorkflowStepAssistantDto(
      input.workflowStepId,
      input.assistantId,
    );
  }
}
