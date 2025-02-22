export class GetAllFavoritesDto {
  readonly teamId: string;
  readonly userId: string;

  constructor(teamId: string, userId: string) {
    this.teamId = teamId.toLowerCase();
    this.userId = userId.toLowerCase();
  }

  static fromInput(payload: {
    teamId: string;
    userId: string;
  }): GetAllFavoritesDto {
    return new GetAllFavoritesDto(payload.teamId, payload.userId);
  }
}
