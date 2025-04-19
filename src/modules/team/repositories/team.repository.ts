import { ExtendedPrismaClient } from '@/modules/database/prisma.extension';
import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';

@Injectable()
export class TeamRepository {
  readonly prisma: ExtendedPrismaClient;
  constructor(
    @Inject('PrismaService')
    private db: CustomPrismaService<ExtendedPrismaClient>,
  ) {
    this.prisma = this.db.client;
  }

  /**
   * Find a team by ID
   * @param teamId - The ID of the team to find
   * @returns
   */
  async findTeamById(teamId: string) {
    return this.prisma.team.findUnique({
      select: {
        id: true,
        name: true,
        users: {
          select: {
            userId: true,
          },
        },
      },
      where: {
        id: teamId,
        deletedAt: null,
      },
    });
  }

  /**
   * Find all teams paginated
   * @param payload.userId - The ID of the user to find teams for
   * @param payload.page - The page number to retrieve
   * @param payload.limit - The number of teams per page
   * @param payload.searchQuery - currently unused
   * @returns
   */
  async findAllTeamsPaginated({
    organisationId,
    page,
    limit,
    searchQuery,
  }: {
    organisationId: string;
    page: number;
    limit: number;
    searchQuery?: string;
  }) {
    return this.prisma.team
      .paginate({
        select: {
          id: true,
          name: true,
        },
        where: {
          organisationId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      .withPages({
        page,
        limit,
        includePageCount: true,
      });
  }

  /**
   * Edit team name
   * @param payload.teamId - The ID of the team to edit
   * @param payload.name - The new name of the team
   * @returns
   */
  async editTeamName({ teamId, name }: { teamId: string; name: string }) {
    return this.prisma.team.update({
      where: {
        id: teamId,
        deletedAt: null,
      },
      data: {
        name,
        updatedAt: new Date(),
      },
    });
  }
}
