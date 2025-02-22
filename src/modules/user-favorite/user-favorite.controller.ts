import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { UserFavoriteService } from './user-favorite.service';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import {
  UserFavoriteResponse,
  UserFavoritesResponse,
} from './interfaces/user-favorite-response.interface';
import {
  FavoriteTypeBody,
  FavoriteTypeParam,
} from './dto/favorite-type-param.dto';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { AddUserFavoriteBody } from './dto/add-user-favorites-body.dto';
import { UserFavoriteDto } from './dto/user-favorite.dto';
import { GetAllFavoritesDto } from './dto/get-all-user-favorites.dto';

@Controller('user-favorite')
export class UserFavoriteController {
  private readonly logger = new Logger(UserFavoriteController.name);
  constructor(private readonly userFavoriteService: UserFavoriteService) {}

  @Post()
  async createFavorite(
    @ReqUser() user: UserEntity,
    @Body() body: AddUserFavoriteBody,
  ): Promise<UserFavoriteResponse> {
    const favoriteDto = UserFavoriteDto.fromInput({
      userId: user.id,
      teamId: user.firstTeamId,
      favoriteId: body.favoriteId,
      favoriteType: body.favoriteType,
    });

    try {
      const favorite = await this.userFavoriteService.create(favoriteDto);
      return { favorite };
    } catch (error) {
      throw new InternalServerErrorException('Error adding favorite');
    }
  }

  @Get()
  async getAllFavorites(
    @ReqUser() user: UserEntity,
  ): Promise<UserFavoritesResponse> {
    const getAllFavoritesDto = GetAllFavoritesDto.fromInput({
      userId: user.id,
      teamId: user.firstTeamId,
    });

    try {
      const favorites =
        await this.userFavoriteService.getAll(getAllFavoritesDto);
      return { favorites };
    } catch (error) {
      throw new NotFoundException('Not found');
    }
  }

  @Get('type/:favoriteType')
  async getFavoritesByType(
    @ReqUser() user: UserEntity,
    @Param() param: FavoriteTypeParam,
  ) {
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
  async deleteFavorite(
    @Param() param: IdParam,
    @ReqUser() user: UserEntity,
    @Body() body: FavoriteTypeBody,
  ): Promise<{ success: boolean }> {
    const userFavoriteDto = UserFavoriteDto.fromInput({
      userId: user.id,
      teamId: user.firstTeamId,
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
      this.logger.error(error);
      throw new InternalServerErrorException('Error removing favorite');
    }
  }
}
