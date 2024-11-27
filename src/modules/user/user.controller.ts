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
import { ApiTags } from '@nestjs/swagger';

@Controller('user')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

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
      return await this.userService.remove(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting user');
    }
  }
}
