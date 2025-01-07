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

  async validate(decoded: any) {
    const userId = decoded.sub;
    const sessionId = decoded.sid;

    if (!userId || !sessionId) {
      throw new UnauthorizedException();
    }

    const sessionData = await this.sessionService.getSession(sessionId);

    if (!sessionData) {
      throw new UnauthorizedException();
    }

    // this.logger.debug(`Session data: ${JSON.stringify(sessionData)}`);

    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      sessionId,
      ...user,
    };
  }
}
