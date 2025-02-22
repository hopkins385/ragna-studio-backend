import { UserFavoriteDto } from './user-favorite.dto';

interface UserFavoriteInput {
  favoriteId: string;
  favoriteType: string;
}

export class GetManyUserFavoritesDto {
  readonly userId: string;
  readonly teamId: string;
  readonly favorites: UserFavoriteDto[];

  constructor(userId: string, teamId: string, favorites: UserFavoriteDto[]) {
    this.userId = userId.toLowerCase();
    this.teamId = teamId.toLowerCase();
    this.favorites = favorites;
  }

  static fromInput(input: {
    userId: string;
    teamId: string;
    favorites: UserFavoriteInput[];
  }): GetManyUserFavoritesDto {
    const favorites = input.favorites.map((favorite) =>
      UserFavoriteDto.fromInput({
        userId: input.userId,
        teamId: input.teamId,
        favoriteId: favorite.favoriteId,
        favoriteType: favorite.favoriteType,
      }),
    );
    return new GetManyUserFavoritesDto(input.userId, input.teamId, favorites);
  }
}
