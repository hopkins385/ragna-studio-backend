import { TeamRepository } from '@/modules/team/repositories/team.repository';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(private readonly teamRepo: TeamRepository) {}
  // edit team
  async editTeam({ teamId, userId, name }: { teamId: string; userId: string; name: string }) {
    try {
      // check if user can edit team
      const existTeam = await this.teamRepo.findTeamById(teamId);

      if (!existTeam) {
        throw new Error('Team not found');
      }

      if (!existTeam.users.some((user) => user.id === userId)) {
        throw new UnauthorizedException('You are not a member of this team');
      }

      const team = await this.teamRepo.editTeamName({
        teamId,
        name,
      });

      return team;
    } catch (error: unknown) {
      this.logger.error('Error editing team', error);
      throw error;
    }
  }
}
