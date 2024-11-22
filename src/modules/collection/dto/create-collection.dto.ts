export class CreateCollectionDto {
  readonly teamId: string;
  readonly name: string;
  readonly description?: string;

  constructor(teamId: string, name: string, description?: string) {
    this.teamId = teamId.toLowerCase();
    this.name = name.toString();
    this.description = description?.toString();
  }

  static fromInput(input: {
    teamId: string;
    name: string;
    description?: string;
  }): CreateCollectionDto {
    return new CreateCollectionDto(input.teamId, input.name, input.description);
  }
}
