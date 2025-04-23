import { BaseController } from '@/common/controllers/base.controller';
import { Roles } from '@/common/decorators/roles.decorator';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { InviteUserBody } from '@/modules/user/dto/invite-user-body.dto';
import { UpdateUserBody } from '@/modules/user/dto/update-user-body.dto';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReqUser } from './decorators/user.decorator';
import { CreateUserBody } from './dto/create-user-body.dto';
import { UserEntity } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(RolesGuard)
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super();
  }

  @Post()
  @Roles(Role.ADMIN)
  async createUser(@Body() createUserBody: CreateUserBody) {
    try {
      return await this.userService.create({
        name: createUserBody.name,
        email: createUserBody.email,
        password: createUserBody.password,
        roleName: createUserBody.roleName,
      });
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Post('invite')
  @Roles(Role.ADMIN)
  async inviteUser(@ReqUser() reqUser: RequestUser, @Body() inviteUserBody: InviteUserBody) {
    try {
      const { inviteToken } = await this.userService.invite({
        name: inviteUserBody.name,
        email: inviteUserBody.email,
        teamId: reqUser.activeTeamId,
        roleName: inviteUserBody.roleName,
      });
      return { inviteToken };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAllUsers(@ReqUser() reqUser: RequestUser, @Query() query: PaginateQuery) {
    try {
      const [users, meta] = await this.userService.findAllPaginated({
        organisationId: reqUser.organisationId,
        page: query.page,
        limit: query.limit,
      });
      return { users, meta };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findUser(@ReqUser() reqUser: RequestUser, @Param() { id }: IdParam) {
    let user: Partial<UserEntity>;

    try {
      user = await this.userService.findOne({
        userId: id,
      });

      if (!user || !this.userService.canAccessUser(reqUser, user as any)) {
        throw new NotFoundException('User not found');
      }

      return { user };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async updateUser(@Param() { id }: IdParam, @Body() updateUserBody: UpdateUserBody) {
    try {
      const user = await this.userService.update(id, updateUserBody);
      return { user };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async softDeleteUser(@Param() { id }: IdParam, @ReqUser() reqUser: RequestUser) {
    throw new InternalServerErrorException('Not implemented yet');
    // current logged in user cannot delete themselves
    if (id === reqUser.id) {
      throw new ForbiddenException('You cannot delete yourself');
    }
    try {
      const result = await this.userService.delete(id);
      return { result };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
