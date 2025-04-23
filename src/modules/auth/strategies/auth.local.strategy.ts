import { AuthService } from '@/modules/auth/auth.service';
import { SessionService } from '@/modules/session/session.service';
import { UserService } from '@/modules/user/user.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CredentialsDto } from '../dto/credentials.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const payload = new CredentialsDto();
    payload.email = email;
    payload.password = password;

    try {
      const randomBetween300and800 = Math.floor(Math.random() * 500) + 300;
      await new Promise((resolve) => setTimeout(resolve, randomBetween300and800));

      const authUser = await this.authService.validateUser(payload);
      if (!authUser) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const sessionData = await this.sessionService.createSessionByUserId({
        userId: authUser.id,
      });
      if (!sessionData) {
        throw new UnauthorizedException('Session creation failed');
      }

      // update last login
      await this.authService.updateLastLogin({ userId: authUser.id });

      return {
        authUser,
        sessionData,
      };
    } catch (error: unknown) {
      throw new UnauthorizedException();
    }
  }
}
