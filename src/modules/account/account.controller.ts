import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { UserService } from '@/modules/user/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { UpdateAccountNameBody } from './dto/update-account-name-body.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UpdateAccountPasswordBody } from './dto/update-account-password-body.dto';
import { DeleteAccountBody } from './dto/delete-account-body.dto';

@Controller('account')
export class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(private readonly userService: UserService) {}

  // @Post()
  // create(@Body() createAccountDto: CreateAccountDto) {
  //   return this.accountService.create(createAccountDto);
  // }

  @Get()
  async find(@ReqUser() user: UserEntity) {
    const { id: userId } = user;
    try {
      const accountData = await this.userService.findOne(userId);
      return accountData;
    } catch (error) {
      throw new NotFoundException('Account not found');
    }
  }

  @Patch('/name')
  async updateName(
    @ReqUser() user: UserEntity,
    @Body() body: UpdateAccountNameBody,
  ) {
    try {
      const accountData = await this.userService.updateUserName(user.id, {
        firstName: body.firstName,
        lastName: body.lastName,
      });
      return accountData;
    } catch (error: any) {
      this.logger.error(`Failed to update account, ${error?.message}`);
      throw new InternalServerErrorException('Failed to update account');
    }
  }

  @Patch('/password')
  async updatePassword(
    @ReqUser() user: UserEntity,
    @Body() body: UpdateAccountPasswordBody,
  ) {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    try {
      const accountData = await this.userService.updateUserPassword(user.id, {
        oldPassword: body.oldPassword,
        newPassword: body.newPassword,
      });
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to update account, ${error?.message}`);
      throw new InternalServerErrorException('Failed to update account');
    }
  }

  @Delete()
  async delete(@ReqUser() user: UserEntity) {
    try {
      await this.userService.softDelete(user.id);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to delete account, ${error?.message}`);
      throw new InternalServerErrorException('Failed to delete account');
    }
  }
}
