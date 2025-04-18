import { BaseController } from '@/common/controllers/base.controller';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Body, Controller, Delete, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { AddUserFavoriteBody } from './dto/add-user-favorites-body.dto';
import { FavoriteTypeBody, FavoriteTypeParam } from './dto/favorite-type-param.dto';
import { GetAllFavoritesDto } from './dto/get-all-user-favorites.dto';
import { UserFavoriteDto } from './dto/user-favorite.dto';
import {
  UserFavoriteResponse,
  UserFavoritesResponse,
} from './interfaces/user-favorite-response.interface';
import { UserFavoriteService } from './user-favorite.service';

@Controller('user-favorite')
export class UserFavoriteController extends BaseController {
  constructor(private readonly userFavoriteService: UserFavoriteService) {
    super();
  }

  @Post()
  async createFavorite(
    @ReqUser() reqUser: RequestUser,
    @Body() body: AddUserFavoriteBody,
  ): Promise<UserFavoriteResponse> {
    const favoriteDto = UserFavoriteDto.fromInput({
      userId: reqUser.id,
      teamId: reqUser.activeTeamId,
      favoriteId: body.favoriteId,
      favoriteType: body.favoriteType,
    });

    try {
      const favorite = await this.userFavoriteService.create(favoriteDto);
      return { favorite };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  async getAllFavorites(@ReqUser() reqUser: RequestUser): Promise<UserFavoritesResponse> {
    const getAllFavoritesDto = GetAllFavoritesDto.fromInput({
      userId: reqUser.id,
      teamId: reqUser.activeTeamId,
    });

    try {
      const favorites = await this.userFavoriteService.getAll(getAllFavoritesDto);
      return { favorites };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('type/:favoriteType')
  async getFavoritesByType(@ReqUser() reqUser: RequestUser, @Param() param: FavoriteTypeParam) {
    try {
      const favorites = await this.userFavoriteService.getAllFavoritesByType(
        reqUser.id,
        param.favoriteType,
      );
      return { favorites };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  async deleteFavorite(
    @Param() param: IdParam,
    @ReqUser() reqUser: RequestUser,
    @Body() body: FavoriteTypeBody,
  ): Promise<{ success: boolean }> {
    const userFavoriteDto = UserFavoriteDto.fromInput({
      userId: reqUser.id,
      teamId: reqUser.activeTeamId,
      favoriteId: param.id,
      favoriteType: body.favoriteType,
    });

    try {
      const result = await this.userFavoriteService.delete(userFavoriteDto);
      if (!result) {
        throw new NotFoundException('Favorite not found');
      }
      return { success: true };
    } catch (error) {
      this.handleError(error);
    }
  }
}
