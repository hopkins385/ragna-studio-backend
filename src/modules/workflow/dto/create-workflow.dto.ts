export class CreateWorkflowDto {
  readonly teamId: string;
  readonly name: string;
  readonly description: string;
  readonly assistantId?: string;

  constructor(
    teamId: string,
    name: string,
    description: string,
    assistantId?: string,
  ) {
    this.teamId = teamId.toLowerCase();
    this.name = name;
    this.description = description;
    this.assistantId = assistantId ? assistantId.toLowerCase() : undefined;
  }

  static fromInput(input: {
    teamId: string;
    name: string;
    description: string;
    assistantId?: string;
  }): CreateWorkflowDto {
    return new CreateWorkflowDto(
      input.teamId,
      input.name,
      input.description,
      input.assistantId,
    );
  }
}
