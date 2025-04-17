import { TeamRepository } from '@/modules/team/repositories/team.repository';
import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(private readonly teamRepo: TeamRepository) {}

  /**
   * Log error
   * @param error
   * @returns
   */
  logError(error: unknown) {
    if (error instanceof HttpException) {
      return;
    }
    this.logger.error('Error editing team', error);
  }

  /**
   * Edit team name
   * @param payload.teamId - The ID of the team to edit
   * @param payload.userId - The ID of the user who is editing the team
   * @param payload.name - The new name of the team
   * @throws NotFoundException if the team is not found
   * @throws UnauthorizedException if the user is not a member of the team
   * @throws Error if the edit operation fails
   * @returns
   */
  async editTeam({ teamId, userId, name }: { teamId: string; userId: string; name: string }) {
    try {
      // check if team exists
      const existTeam = await this.teamRepo.findTeamById(teamId);

      if (!existTeam) {
        throw new NotFoundException('Team not found');
      }

      // check if user can edit team
      if (!existTeam.users.some((teamUser) => teamUser.userId === userId)) {
        throw new UnauthorizedException('You are not a member of this team');
      }

      const team = await this.teamRepo.editTeamName({
        teamId,
        name,
      });

      if (!team) {
        throw new Error('Invalid edit team result');
      }

      return team;
    } catch (error: unknown) {
      this.logError(error);
      throw error;
    }
  }
}
