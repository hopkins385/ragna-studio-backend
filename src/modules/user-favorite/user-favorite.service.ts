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
      select: { id: true, userId: true, favoriteId: true, favoriteType: true },
      where: { userId: user.id },
    });
    // fetch also the details of the favorite
    const favoriteDetails = await this.getManyFavoriteDetails({
      teamId: user.firstTeamId,
      favorites,
    });

    return favorites.map((favorite, index) => ({
      id: favorite.id,
      favoriteId: favorite.favoriteId,
      favoriteType: favorite.favoriteType,
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
      ? await this.repo.prisma.assistant.findMany({
          select: { id: true, title: true, description: true },
          where: {
            id: { in: groupedFavorites['assistant'] },
            teamId,
          },
        })
      : [];

    // Fetch all workflows in one query
    const workflows = groupedFavorites['workflow']
      ? await this.repo.prisma.workflow.findMany({
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
}
