import { UserFavoriteRepository } from './repositories/user-favorite.repository';
import { Module } from '@nestjs/common';
import { UserFavoriteService } from './user-favorite.service';
import { UserFavoriteController } from './user-favorite.controller';

@Module({
  controllers: [UserFavoriteController],
  providers: [UserFavoriteRepository, UserFavoriteService],
})
export class UserFavoriteModule {}
