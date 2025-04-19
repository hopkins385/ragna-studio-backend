import { BaseController } from '@/common/controllers/base.controller';
import { Roles } from '@/common/decorators/roles.decorator';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { EditTeamBody } from '@/modules/team/dto/edit-team-body.dto';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Role } from '@/modules/user/enums/role.enum';
import { RolesGuard } from '@/modules/user/guards/roles.guard';
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';

@Controller('team')
@UseGuards(RolesGuard)
export class TeamController extends BaseController {
  constructor(private readonly teamService: TeamService) {
    super();
  }

  @Get('all')
  @Roles(Role.ADMIN)
  async getAllTeams(@Query() query: PaginateQuery, @ReqUser() reqUser: RequestUser) {
    try {
      const { teams, meta } = await this.teamService.getAllTeamsPaginated({
        organisationId: reqUser.organisationId,
        page: query.page,
        limit: query.limit,
        searchQuery: query.searchQuery,
      });
      return { teams, meta };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async getTeam(@Param() param: IdParam, @ReqUser() reqUser: RequestUser) {
    try {
      const team = await this.teamService.getTeam({
        userId: reqUser.id,
        teamId: param.id,
      });
      return { team };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

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
      this.handleError(error);
    }
  }
}
