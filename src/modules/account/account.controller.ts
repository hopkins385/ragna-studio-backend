import { ReqUser } from './../user/decorators/user.decorator';
import { UserService } from './../user/user.service';
import { Controller, Get } from '@nestjs/common';
import { AccountService } from './account.service';
import { UserEntity } from '@/modules/user/entities/user.entity';

@Controller('account')
export class AccountController {
  constructor(
    private readonly userService: UserService,
    private readonly accountService: AccountService,
  ) {}

  // @Post()
  // create(@Body() createAccountDto: CreateAccountDto) {
  //   return this.accountService.create(createAccountDto);
  // }

  @Get()
  async find(@ReqUser() user: UserEntity) {
    const { id: userId } = user;
    const accountData = await this.userService.findOne(userId);
    return accountData;
  }
}
