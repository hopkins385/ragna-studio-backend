import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { UserService } from '@/modules/user/user.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Patch,
  Post,
} from '@nestjs/common';
import { DeleteAccountBody } from './dto/delete-account-body.dto';
import { UpdateAccountNameBody } from './dto/update-account-name-body.dto';
import { UpdateAccountPasswordBody } from './dto/update-account-password-body.dto';

@Controller('account')
export class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(private readonly userService: UserService) {}

  // @Post()
  // create(@Body() createAccountDto: CreateAccountDto) {
  //   return this.accountService.create(createAccountDto);
  // }

  @Get()
  async find(@ReqUser() reqUser: RequestUser) {
    const { id: userId } = reqUser;
    try {
      const accountData = await this.userService.findOne({ userId });
      return accountData;
    } catch (error) {
      throw new NotFoundException('Account not found');
    }
  }

  @Patch('/name')
  async updateName(@ReqUser() reqUser: RequestUser, @Body() body: UpdateAccountNameBody) {
    try {
      const accountData = await this.userService.updateUserName(reqUser.id, {
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
  async updatePassword(@ReqUser() reqUser: RequestUser, @Body() body: UpdateAccountPasswordBody) {
    try {
      const accountData = await this.userService.updateUserPassword(reqUser.id, {
        oldPassword: body.oldPassword,
        newPassword: body.newPassword,
      });
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to update account, ${error?.message}`);
      throw new InternalServerErrorException('Failed to update account');
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('/delete')
  async delete(@ReqUser() reqUser: RequestUser, @Body() body: DeleteAccountBody) {
    try {
      await this.userService.softDeleteUser(reqUser.id, {
        password: body.password,
      });
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to delete account, ${error?.message}`);
      throw new InternalServerErrorException('Failed to delete account');
    }
  }
}
