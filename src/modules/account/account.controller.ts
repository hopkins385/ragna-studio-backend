import { BaseController } from '@/common/controllers/base.controller';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { UserService } from '@/modules/user/user.service';
import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { DeleteAccountBody } from './dto/delete-account-body.dto';
import { UpdateAccountNameBody } from './dto/update-account-name-body.dto';
import { UpdateAccountPasswordBody } from './dto/update-account-password-body.dto';

@Controller('account')
export class AccountController extends BaseController {
  //
  constructor(private readonly userService: UserService) {
    super();
  }

  @Get()
  async find(@ReqUser() reqUser: RequestUser) {
    try {
      const account = await this.userService.getAccountData({ userId: reqUser.id });
      return { account };
    } catch (error: unknown) {
      this.handleError(error);
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
    } catch (error: unknown) {
      this.handleError(error);
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
    } catch (error: unknown) {
      this.handleError(error);
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
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
