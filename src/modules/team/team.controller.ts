import { Roles } from '@/common/decorators/roles.decorator';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { EditTeamBody } from '@/modules/team/dto/edit-team-body.dto';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Role } from '@/modules/user/enums/role.enum';
import { RolesGuard } from '@/modules/user/guards/roles.guard';
import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';

@Controller('team')
@UseGuards(RolesGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Patch(':id/edit')
  @Roles(Role.ADMIN)
  async editTeam(
    @Param() param: IdParam,
    @ReqUser() reqUser: RequestUser,
    @Body() body: EditTeamBody,
  ) {
    try {
      const team = await this.teamService.editTeam({
        teamId: param.id,
        userId: reqUser.id,
        name: body.name,
      });

      return { team };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('An error occurred while editing the team');
    }
  }
}
