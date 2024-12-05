import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserFavoriteService } from './user-favorite.service';
import { UserEntity } from '../user/entities/user.entity';
import { ReqUser } from '../user/decorators/user.decorator';
import {
  UserFavoriteResponse,
  UserFavoritesResponse,
} from './interfaces/user-favorite-response.interface';
import {
  FavoriteTypeBody,
  FavoriteTypeParam,
} from './dto/favorite-type-param.dto';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { ManyUserFavoritesBody } from './dto/many-user-favorites-body.dto';
import { AddUserFavoriteBody } from './dto/add-user-favorites-body.dto';

@Controller('user-favorite')
export class UserFavoriteController {
  constructor(private readonly userFavoriteService: UserFavoriteService) {}

  @Post()
  async addFavorite(
    @ReqUser() user: UserEntity,
    @Body() body: AddUserFavoriteBody,
  ): Promise<UserFavoriteResponse> {
    try {
      const favorite = await this.userFavoriteService.addFavorite(
        user.id,
        body.favoriteId,
        body.favoriteType,
      );

      return { favorite };
    } catch (error) {
      throw new InternalServerErrorException('Error adding favorite');
    }
  }

  @Get()
  async getFavorites(@ReqUser() user: UserEntity) {
    try {
      const favorites = await this.userFavoriteService.getAllFavorites(user);
      return { favorites };
    } catch (error) {
      throw new NotFoundException('Not found');
    }
  }

  @Get('detail/:id')
  async getFavoriteDetail(
    @Param() param: IdParam,
    @ReqUser() user: UserEntity,
    @Body() body: FavoriteTypeBody,
  ) {
    try {
      const favorite = await this.userFavoriteService.getFavoriteDetails(
        user.firstTeamId,
        param.id,
        body.favoriteType,
      );
      return { favorite };
    } catch (error) {
      throw new NotFoundException('Not found');
    }
  }

  @Get('many-details')
  async getManyFavoriteDetails(
    @ReqUser() user: UserEntity,
    @Body() body: ManyUserFavoritesBody,
  ) {
    try {
      const favorites = await this.userFavoriteService.getManyFavoriteDetails({
        teamId: user.firstTeamId,
        favorites: body.favorites.map((f) => ({
          userId: user.id,
          favoriteId: f.favoriteId,
          favoriteType: f.favoriteType,
        })),
      });
      return { favorites };
    } catch (error) {
      throw new NotFoundException('Not found');
    }
  }

  @Get('type/:favoriteType')
  async getFavoritesByType(
    @ReqUser() user: UserEntity,
    @Param() param: FavoriteTypeParam,
  ): Promise<UserFavoritesResponse> {
    try {
      const favorites = await this.userFavoriteService.getAllFavoritesByType(
        user.id,
        param.favoriteType,
      );
      return { favorites };
    } catch (error) {
      throw new NotFoundException('Not found');
    }
  }

  @Delete(':id')
  async removeFavorite(
    @Param() param: IdParam,
    @ReqUser() user: UserEntity,
    @Body() body: FavoriteTypeBody,
  ) {
    try {
      const r = await this.userFavoriteService.removeFavorite({
        id: param.id,
        userId: user.id,
        favoriteType: body.favoriteType,
      });

      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Error removing favorite');
    }
  }
}
