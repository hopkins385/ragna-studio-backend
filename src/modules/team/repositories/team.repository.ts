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

  // find team by id
  async findTeamById(teamId: string) {
    return this.prisma.team.findUnique({
      select: {
        id: true,
        name: true,
        users: {
          select: {
            id: true,
          },
        },
      },
      where: {
        id: teamId,
      },
    });
  }

  // change team name
  async editTeamName({ teamId, name }: { teamId: string; name: string }) {
    return this.prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        name,
      },
    });
  }
}
