import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserFavoriteRepository } from './repositories/user-favorite.repository';
import { UserFavorite } from './interfaces/user-favorite.interface';
import { BaseService } from '@/common/service/base.service';
import { UserFavoriteNotFoundException } from './exceptions/user-favorite-not-found.exception';
import { UserFavoriteDto } from './dto/user-favorite.dto';
import { GetAllFavoritesDto } from './dto/get-all-user-favorites.dto';
import { GetManyUserFavoritesDto } from './dto/get-many-user-favorite.dto';

@Injectable()
export class UserFavoriteService extends BaseService<UserFavorite> {
  constructor(private readonly repository: UserFavoriteRepository) {
    super(UserFavoriteService.name);
  }

  private handleError(error: unknown) {
    if (error instanceof UserFavoriteNotFoundException) {
      throw error;
    }
    if (error instanceof Error) {
      this.logger.error(`Error: ${error.message}`, error.stack);
      throw new InternalServerErrorException(error.message);
    }
    throw new InternalServerErrorException('Unknown error');
  }

  async getOne(pyload: any): Promise<UserFavorite> {
    throw new Error('Method not implemented.');
  }

  async getMany(payload: any): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async findAll(payload: any) {
    throw new Error('Method not implemented.');
  }

  async update(payload: any): Promise<UserFavorite> {
    throw new Error('Method not implemented.');
  }

  async create(payload: UserFavoriteDto): Promise<UserFavorite> {
    const runPayload = {
      userId: payload.userId,
      favoriteId: payload.favoriteId,
      favoriteType: payload.favoriteType,
    };

    try {
      const existingFavorite =
        await this.repository.getUserFavorite(runPayload);

      if (existingFavorite) {
        return existingFavorite;
      }

      return await this.repository.createUserFavorite(runPayload);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAll(payload: GetAllFavoritesDto): Promise<any[]> {
    // TODO: Define the return type

    try {
      const favorites = await this.repository.getAllFavoritesForUser({
        userId: payload.userId,
      });
      if (!favorites) {
        return [];
      }

      const getManyFavoriteDetailsDto = GetManyUserFavoritesDto.fromInput({
        userId: payload.userId,
        teamId: payload.teamId,
        favorites,
      });
      // fetch also the details of the favorite
      const favoriteDetails = await this.getManyFavoriteDetails(
        getManyFavoriteDetailsDto,
      );

      return favorites.map((favorite, index) => ({
        id: favorite.id,
        favoriteId: favorite.favoriteId,
        favoriteType: favorite.favoriteType,
        detail: favoriteDetails[index],
      }));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllFavoritesByType(
    userId: string,
    favoriteType: string,
  ): Promise<UserFavorite[]> {
    return this.repository.getAllFavoritesForUserByType({
      userId,
      favoriteType,
    });
  }

  async isFavorite(
    userId: string,
    favoriteId: string,
    favoriteType: string,
  ): Promise<boolean> {
    const favorite = await this.repository.getUserFavorite({
      userId,
      favoriteId,
      favoriteType,
    });

    return !!favorite;
  }

  async getFavoriteDetails(payload: UserFavoriteDto) {
    throw new Error('Method not implemented.');
    /*
    switch (payload.favoriteType) {
      case 'assistant':
        return this.repository.prisma.assistant.findFirst({
          select: { title: true },
          where: { id: payload.favoriteId, teamId: payload.teamId },
        });
      case 'workflow':
        return this.repository.prisma.workflow.findFirst({
          select: { name: true },
          where: { id: payload.favoriteId, teamId: payload.teamId },
        });
      default:
        return null;
    }
        */
  }

  async getManyFavoriteDetails({ teamId, favorites }: GetManyUserFavoritesDto) {
    // Group favorites by type
    const groupedFavorites = favorites.reduce(
      (acc, favorite) => {
        if (!acc[favorite.favoriteType]) {
          acc[favorite.favoriteType] = [];
        }
        acc[favorite.favoriteType].push(favorite.favoriteId);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    // Fetch all assistants in one query
    const assistants = groupedFavorites['assistant']
      ? await this.repository.prisma.assistant.findMany({
          select: { id: true, title: true, description: true },
          where: {
            id: { in: groupedFavorites['assistant'] },
            teamId,
          },
        })
      : [];

    // Fetch all workflows in one query
    const workflows = groupedFavorites['workflow']
      ? await this.repository.prisma.workflow.findMany({
          select: { id: true, name: true, description: true },
          where: {
            id: { in: groupedFavorites['workflow'] },
            teamId,
          },
        })
      : [];

    // Create lookup maps
    const assistantMap = new Map(assistants.map((a) => [a.id, a]));
    const workflowMap = new Map(workflows.map((w) => [w.id, w]));

    // Map back to original order
    return favorites.map((favorite) => {
      if (favorite.favoriteType === 'assistant') {
        return assistantMap.get(favorite.favoriteId) || null;
      }
      if (favorite.favoriteType === 'workflow') {
        return workflowMap.get(favorite.favoriteId) || null;
      }
      return null;
    });
  }

  async softDelete(payload: any): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async delete(payload: UserFavoriteDto): Promise<boolean> {
    try {
      const existingFavorite = await this.repository.getUserFavorite(payload);
      if (!existingFavorite) {
        throw new UserFavoriteNotFoundException(payload.favoriteId);
      }
      const result = await this.repository.deleteUserFavorite(payload);
      return !!result;
    } catch (error) {
      this.handleError(error);
    }
  }
}
