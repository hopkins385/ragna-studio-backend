export class CreateWorkflowStepDto {
  readonly workflowId: string;
  readonly teamId: string;
  readonly name: string;
  readonly description: string;
  readonly orderColumn: number;
  readonly rowCount: number;
  readonly assistantId: string;
  readonly rowContents?: string[];

  constructor(
    workflowId: string,
    teamId: string,
    name: string | number | undefined,
    description: string,
    orderColumn: number,
    rowCount: number,
    assistantId: string,
    rowContents?: string[],
  ) {
    this.workflowId = workflowId.toLowerCase();
    this.teamId = teamId.toLowerCase();
    this.assistantId = assistantId ? assistantId.toLowerCase() : undefined;
    this.name = name?.toString() || '';
    this.description = description;
    this.orderColumn = orderColumn;
    this.rowCount = rowCount;
    this.rowContents = rowContents;
  }

  static fromInput(input: {
    workflowId: string;
    teamId: string;
    name: string;
    description: string;
    orderColumn: number;
    rowCount: number;
    assistantId: string;
    rowContents?: string[];
  }): CreateWorkflowStepDto {
    return new CreateWorkflowStepDto(
      input.workflowId,
      input.teamId,
      input.name,
      input.description,
      input.orderColumn,
      input.rowCount,
      input.assistantId,
      input.rowContents,
    );
  }
}
