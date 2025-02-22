import { ExtendedPrismaClient } from '@/modules/database/prisma.extension';
import { Inject, Injectable, Get } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';

interface UserFavoritePayload {
  userId: string;
  favoriteId: string;
  favoriteType: string;
}

interface GetAllFavoritesPayload {
  userId: string;
}

@Injectable()
export class UserFavoriteRepository {
  readonly prisma: ExtendedPrismaClient;
  constructor(
    @Inject('PrismaService')
    private readonly db: CustomPrismaService<ExtendedPrismaClient>,
  ) {
    this.prisma = this.db.client;
  }

  // *~ CREATE ~* //

  async createUserFavorite(payload: UserFavoritePayload) {
    return this.prisma.userFavorite.create({
      data: {
        userId: payload.userId,
        favoriteId: payload.favoriteId,
        favoriteType: payload.favoriteType,
      },
    });
  }

  // *~ READ ~* //

  async getUserFavorite(payload: UserFavoritePayload) {
    return this.prisma.userFavorite.findFirst({
      where: {
        userId: payload.userId,
        id: payload.favoriteId,
        favoriteType: payload.favoriteType,
      },
    });
  }
  async getAllFavoritesForUser(payload: GetAllFavoritesPayload) {
    return this.prisma.userFavorite.findMany({
      select: { id: true, userId: true, favoriteId: true, favoriteType: true },
      where: {
        userId: payload.userId,
      },
    });
  }

  async getAllFavoritesForUserByType(payload: {
    userId: string;
    favoriteType: string;
  }) {
    return this.prisma.userFavorite.findMany({
      select: { id: true, userId: true, favoriteId: true, favoriteType: true },
      where: {
        userId: payload.userId,
        favoriteType: payload.favoriteType,
      },
    });
  }

  async findAll(payload: any) {}

  // *~ UPDATE ~* //

  // *~ DELETE ~* //

  async deleteUserFavorite(payload: UserFavoritePayload) {
    return this.prisma.userFavorite.delete({
      where: {
        userId: payload.userId,
        id: payload.favoriteId,
        favoriteType: payload.favoriteType,
      },
    });
  }
}
