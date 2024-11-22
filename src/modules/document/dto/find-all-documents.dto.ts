export class FindAllDocumentsDto {
  readonly teamId: string;
  readonly page: number;

  constructor(teamId: string, page: number) {
    this.teamId = teamId.toLowerCase();
    this.page = page;
  }

  static fromInput(input: {
    teamId: string;
    page: number;
  }): FindAllDocumentsDto {
    return new FindAllDocumentsDto(input.teamId, input.page);
  }
}
