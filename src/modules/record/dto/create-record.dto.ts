export class CreateRecordDto {
  readonly collectionId: string;
  readonly mediaId: string;
  readonly teamId: string;

  constructor(collectionId: string, mediaId: string, teamId: string) {
    this.collectionId = collectionId.toLowerCase();
    this.mediaId = mediaId.toLowerCase();
    this.teamId = teamId.toLowerCase();
  }

  static fromInput(input: {
    collectionId: string;
    mediaId: string;
    teamId: string;
  }): CreateRecordDto {
    return new CreateRecordDto(input.collectionId, input.mediaId, input.teamId);
  }
}

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
