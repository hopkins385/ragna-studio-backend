import { TeamRepository } from '@/modules/team/repositories/team.repository';
import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  controllers: [TeamController],
  providers: [TeamService, TeamRepository],
})
export class TeamModule {}
