import { NotFoundException } from '@nestjs/common';

export class UserFavoriteNotFoundException extends NotFoundException {
  constructor(favoriteId: string) {
    super(`User favorite with ID ${favoriteId} not found`);
  }
}
