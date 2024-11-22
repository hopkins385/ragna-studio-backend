export class FindAllAssistantsDto {
  readonly teamId: string;
  readonly page: number;
  readonly limit: number;
  readonly searchQuery: string | undefined;

  constructor(
    teamId: string,
    page: number,
    limit?: number,
    searchQuery?: string,
  ) {
    this.teamId = teamId.toLowerCase();
    this.page = Number(page);
    this.limit = limit || 10;
    this.searchQuery = searchQuery?.toString();
  }

  static fromInput({
    teamId,
    page,
    limit,
    searchQuery,
  }: {
    teamId: string;
    page: number;
    limit?: number;
    searchQuery?: string;
  }): FindAllAssistantsDto {
    return new FindAllAssistantsDto(teamId, page, limit, searchQuery);
  }
}
