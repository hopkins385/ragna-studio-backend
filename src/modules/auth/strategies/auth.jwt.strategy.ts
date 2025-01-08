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
    const decodedUserId = decoded.sub;
    const decodedSessionId = decoded.sid;

    if (!decodedUserId || !decodedSessionId) {
      throw new UnauthorizedException();
    }

    const sessionData = await this.sessionService.getSession(decodedSessionId);

    if (!sessionData || !sessionData.user) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne(sessionData.user.id);

    if (!user || user.id !== decodedUserId) {
      throw new UnauthorizedException();
    }

    return {
      sessionId: decodedSessionId,
      ...user,
    };
  }
}
