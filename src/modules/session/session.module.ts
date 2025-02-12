import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionRepository } from './repositories/session.repository';

@Module({
  providers: [SessionRepository, SessionService],
})
export class SessionModule {}
