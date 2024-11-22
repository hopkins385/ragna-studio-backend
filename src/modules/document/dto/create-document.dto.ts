export class CreateDocumentDto {
  readonly name: string;
  readonly description: string;
  readonly status: string;
  readonly teamId: string;

  constructor(
    name: string,
    description: string,
    status: string,
    teamId: string,
  ) {
    this.name = name;
    this.description = description;
    this.status = status;
    this.teamId = teamId.toLowerCase();
  }

  static fromInput(input: {
    name: string;
    description: string;
    status: string;
    teamId: string;
  }): CreateDocumentDto {
    return new CreateDocumentDto(
      input.name,
      input.description,
      input.status,
      input.teamId,
    );
  }
}
