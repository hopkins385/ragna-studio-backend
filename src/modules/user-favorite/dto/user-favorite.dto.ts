interface UserFavoritePayload {
  userId: string;
  teamId: string;
  favoriteId: string;
  favoriteType: string;
}

export class UserFavoriteDto {
  readonly userId: string;
  readonly teamId: string;
  readonly favoriteId: string;
  readonly favoriteType: string;

  constructor(payload: UserFavoritePayload) {
    this.userId = payload.userId.toLowerCase();
    this.teamId = payload.teamId.toLowerCase();
    this.favoriteId = payload.favoriteId.toLowerCase();
    this.favoriteType = payload.favoriteType;
  }

  static fromInput(payload: UserFavoritePayload): UserFavoriteDto {
    return new UserFavoriteDto(payload);
  }
}
