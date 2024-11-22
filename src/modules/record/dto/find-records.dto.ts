export class FindRecordsDto {
  readonly collectionId: string;
  readonly teamId: string;

  constructor(collectionId: string, teamId: string) {
    this.collectionId = collectionId.toLowerCase();
    this.teamId = teamId.toLowerCase();
  }

  static fromInput(input: {
    collectionId: string;
    teamId: string;
  }): FindRecordsDto {
    return new FindRecordsDto(input.collectionId, input.teamId);
  }
}
