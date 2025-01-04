import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/auth.local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '@/modules/user/user.module';
import { JwtStrategy } from './strategies/auth.jwt.strategy';
import { JwtRefreshStrategy } from './strategies/auth.refreshToken.strategy';
import { AuthGoogleService } from './google/auth-google.service';
import { SessionService } from '@/modules/session/session.service';
import { QueueModule } from '@/modules/queue/queue.module';

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
    AuthGoogleService,
    SessionService,
  ],
})
export class AuthModule {}
