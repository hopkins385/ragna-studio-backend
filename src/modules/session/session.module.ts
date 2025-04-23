import { UserModule } from '@/modules/user/user.module';
import { Module } from '@nestjs/common';
import { SessionRepository } from './repositories/session.repository';
import { SessionService } from './session.service';

@Module({
  imports: [UserModule],
  providers: [SessionRepository, SessionService],
  exports: [SessionService],
})
export class SessionModule {}
