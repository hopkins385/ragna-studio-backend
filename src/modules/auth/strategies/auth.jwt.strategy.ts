import { SessionService } from '@/modules/session/session.service';
import { SessionUser } from '@/modules/user/entities/session-user.entity';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
      // algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    const userId = payload.sub;
    const sessionId = payload.sid;

    if (!userId || !sessionId) {
      throw new UnauthorizedException();
    }
    // find session in request.session (express session)
    // const session = await this.sessionService.getSession(sessionId);
    // console.log('session', session);

    // if session not found, throw unauthorized exception
    const user = await this.userService.findOne(userId);
    // const user = await this.userService.getSessionUser({ userId });
    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      sessionId,
      ...user,
    };
  }
}
