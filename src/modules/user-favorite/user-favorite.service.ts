import { Injectable, Logger } from '@nestjs/common';
import { UserFavoriteRepository } from './repositories/user-favorite.repository';
import { UserFavorite } from './interfaces/user-favorite.interface';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class UserFavoriteService {
  private readonly logger = new Logger(UserFavoriteService.name);

  constructor(private readonly repo: UserFavoriteRepository) {}

  async addFavorite(
    userId: string,
    favoriteId: string,
    favoriteType: string,
  ): Promise<UserFavorite> {
    const existingFavorite = await this.repo.prisma.userFavorite.findFirst({
      where: {
        userId,
        favoriteId,
        favoriteType,
      },
    });

    if (existingFavorite) {
      return existingFavorite;
    }

    return this.repo.prisma.userFavorite.create({
      data: {
        userId,
        favoriteId,
        favoriteType,
      },
    });
  }

  async removeFavorite({
    id,
    userId,
    favoriteType,
  }: {
    id: string;
    userId: string;
    favoriteType: string;
  }): Promise<void> {
    await this.repo.prisma.userFavorite.delete({
      where: {
        id,
        userId,
        favoriteType,
      },
    });
  }

  async getAllFavorites(user: UserEntity) {
    const favorites = await this.repo.prisma.userFavorite.findMany({
      where: { userId: user.id },
    });
    // fetch also the details of the favorite
    const favoriteDetails = await this.getManyFavoriteDetails({
      teamId: user.firstTeamId,
      favorites,
    });

    return favorites.map((favorite, index) => ({
      ...favorite,
      detail: favoriteDetails[index],
    }));
  }

  async getAllFavoritesByType(
    userId: string,
    favoriteType: string,
  ): Promise<UserFavorite[]> {
    return this.repo.prisma.userFavorite.findMany({
      where: {
        userId,
        favoriteType,
      },
    });
  }

  async isFavorite(
    userId: string,
    favoriteId: string,
    favoriteType: string,
  ): Promise<boolean> {
    const favorite = await this.repo.prisma.userFavorite.findFirst({
      where: {
        userId,
        favoriteId,
        favoriteType,
      },
    });

    return !!favorite;
  }

  async getFavoriteDetails(
    teamId: string,
    favoriteId: string,
    favoriteType: string,
  ) {
    switch (favoriteType) {
      case 'assistant':
        return this.repo.prisma.assistant.findFirst({
          select: { title: true },
          where: { id: favoriteId, teamId },
        });
      case 'workflow':
        return this.repo.prisma.workflow.findFirst({
          select: { name: true },
          where: { id: favoriteId, teamId },
        });
      default:
        return null;
    }
  }

  async getManyFavoriteDetails({
    teamId,
    favorites,
  }: {
    teamId: string;
    favorites: UserFavorite[];
  }) {
    return Promise.all(
      favorites.map((favorite) =>
        this.getFavoriteDetails(
          teamId,
          favorite.favoriteId,
          favorite.favoriteType,
        ),
      ),
    );
  }
}
