import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Session,
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
      return await this.userService.createInviteToken({ userId: user.id });
    } catch (error: any) {
      this.logger.error(`Error creating invite token: ${error?.message}`);
      throw new InternalServerErrorException('Error creating invite token');
    }
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    try {
      const [users, meta] = await this.userService.findAllPaginated();
      return { users, meta };
    } catch (error) {
      throw new NotFoundException('Users not found');
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@Param() { id }: IdParam) {
    try {
      return await this.userService.findOne(id);
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param() { id }: IdParam, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.userService.update(id, updateUserDto);
    } catch (error) {
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
      return await this.userService.delete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting user');
    }
  }
}
