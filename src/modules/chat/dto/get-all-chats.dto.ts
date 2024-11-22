export class GetAllChatsForUserDto {
  readonly userId: string;
  readonly page: number;
  readonly limit: number;
  readonly searchQuery: string | undefined;

  constructor(
    userId: string,
    page: number,
    limit?: number,
    searchQuery?: string,
  ) {
    this.userId = userId.toLowerCase();
    this.page = Number(page) || 1;
    this.limit = Number(limit) || 10;
    this.searchQuery = searchQuery?.toString() || undefined;
  }

  static fromInput(input: {
    userId: string;
    page: number;
    limit?: number;
    searchQuery?: string;
  }): GetAllChatsForUserDto {
    return new GetAllChatsForUserDto(
      input.userId,
      input.page,
      input.limit,
      input.searchQuery,
    );
  }
}
