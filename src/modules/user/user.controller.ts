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
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    const [users, meta] = await this.userService.findAllPaginated();

    return { users, meta };
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param() { id }: IdParam) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param() { id }: IdParam, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param() { id }: IdParam, @ReqUser() user: UserEntity) {
    // current logged in user cannot delete themselves
    if (id === user.id) {
      throw new ForbiddenException('You cannot delete yourself');
    }
    return this.userService.remove(id);
  }
}
