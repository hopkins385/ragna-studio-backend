import { QueueModule } from '@/modules/queue/queue.module';
import { SessionRepository } from '@/modules/session/repositories/session.repository';
import { SessionService } from '@/modules/session/session.service';
import { UserModule } from '@/modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/auth.jwt.strategy';
import { LocalStrategy } from './strategies/auth.local.strategy';
import { JwtRefreshStrategy } from './strategies/auth.refreshToken.strategy';

const jwtFactory = {
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15min'),
    },
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    QueueModule,
    UserModule, // Required by AuthService
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync(jwtFactory),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    SessionRepository,
    SessionService,
    // AuthGoogleService,
  ],
})
export class AuthModule {}
