import { Roles } from '@/common/decorators/roles.decorator';
import { IdParam } from '@/common/dto/cuid-param.dto';
import { PaginateQuery } from '@/common/dto/paginate.dto';
import { InviteUserBody } from '@/modules/user/dto/invite-user-body.dto';
import { UpdateUserBody } from '@/modules/user/dto/update-user-body.dto';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Logger,
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
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createUserBody: CreateUserBody) {
    try {
      return await this.userService.create({
        name: createUserBody.name,
        email: createUserBody.email,
        password: createUserBody.password,
        roleName: createUserBody.roleName,
      });
    } catch (error: unknown) {
      this.logger.error(`Error creating user`, error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  @Post('invite')
  @Roles(Role.ADMIN)
  async invite(@ReqUser() reqUser: RequestUser, @Body() inviteUserBody: InviteUserBody) {
    try {
      const { inviteToken } = await this.userService.invite({
        name: inviteUserBody.name,
        email: inviteUserBody.email,
        teamId: reqUser.activeTeamId,
        roleName: inviteUserBody.roleName,
      });
      return { inviteToken };
    } catch (error: unknown) {
      this.logger.error(`Error creating user`, error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  /*@Get('/invite-token')
  @Roles(Role.ADMIN)
  async createInviteToken(@ReqUser() reqUser: RequestUser) {
    try {
      const token = await this.userService.createInviteToken({
        reqUserId: reqUser.id,
      });
      return { token };
    } catch (error: unknown) {
      this.logger.error(`Error creating invite token`, error);
      throw new InternalServerErrorException('Error creating invite token');
    }
  }*/

  @Get()
  @Roles(Role.ADMIN)
  async findAll(@ReqUser() reqUser: RequestUser, @Query() query: PaginateQuery) {
    try {
      const [users, meta] = await this.userService.findAllPaginated({
        organisationId: reqUser.organisationId,
        page: query.page,
        limit: query.limit,
      });
      return { users, meta };
    } catch (error: unknown) {
      this.logger.error(`Error getting users`, error);
      throw new NotFoundException('Users not found');
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@ReqUser() reqUser: RequestUser, @Param() { id }: IdParam) {
    let user: Partial<UserEntity>;

    try {
      user = await this.userService.findOne({
        userId: id,
      });
    } catch (error: unknown) {
      this.logger.error(`Error getting user`, error);
      throw new InternalServerErrorException('Error getting user');
    }

    if (!user || !this.userService.canAccessUser(reqUser, user as any)) {
      throw new NotFoundException('User not found');
    }

    return { user };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param() { id }: IdParam, @Body() updateUserBody: UpdateUserBody) {
    try {
      const user = await this.userService.update(id, updateUserBody);
      return { user };
    } catch (error: unknown) {
      this.logger.error(`Error updating user`, error);
      throw new InternalServerErrorException('Error updating user');
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param() { id }: IdParam, @ReqUser() reqUser: RequestUser) {
    // current logged in user cannot delete themselves
    if (id === reqUser.id) {
      throw new ForbiddenException('You cannot delete yourself');
    }
    try {
      const result = await this.userService.delete(id);
      return { result };
    } catch (error: unknown) {
      this.logger.error(`Error deleting user`, error);
      throw new InternalServerErrorException('Error deleting user');
    }
  }
}
