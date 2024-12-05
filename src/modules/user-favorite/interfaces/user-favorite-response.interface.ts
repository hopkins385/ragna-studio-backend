import { UserFavorite } from './user-favorite.interface';

export interface UserFavoriteResponse {
  favorite: UserFavorite;
}

export interface UserFavoritesResponse {
  favorites: UserFavorite[];
}
