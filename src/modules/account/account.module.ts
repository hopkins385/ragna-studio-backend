import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AccountController],
  providers: [],
})
export class AccountModule {}
