import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { ReqUser } from './decorators/user.decorator';
import { UserEntity } from './entities/user.entity';
import { IdParam } from '@/common/dto/cuid-param.dto';

@Controller('user')
@UseGuards(RolesGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get('/invite-token')
  @Roles(Role.ADMIN)
  async createInviteToken(@ReqUser() user: UserEntity) {
    try {
      const token = await this.userService.createInviteToken({
        userId: user.id,
      });
      return { token };
    } catch (error: unknown) {
      this.logger.error(`Error creating invite token`, error);
      throw new InternalServerErrorException('Error creating invite token');
    }
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (error: unknown) {
      this.logger.error(`Error creating user`, error);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll(@ReqUser() user: UserEntity) {
    try {
      const [users, meta] = await this.userService.findAllPaginated({
        organisationId: user.organisationId,
      });
      return { users, meta };
    } catch (error: unknown) {
      this.logger.error(`Error getting users`, error);
      throw new NotFoundException('Users not found');
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@ReqUser() reqUser: UserEntity, @Param() { id }: IdParam) {
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
  async update(@Param() { id }: IdParam, @Body() updateUserDto: UpdateUserDto) {
    try {
      const result = await this.userService.update(id, updateUserDto);
      return { result };
    } catch (error: unknown) {
      this.logger.error(`Error updating user`, error);
      throw new InternalServerErrorException('Error updating user');
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param() { id }: IdParam, @ReqUser() user: UserEntity) {
    // current logged in user cannot delete themselves
    if (id === user.id) {
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
