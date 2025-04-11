import { SessionService } from '@/modules/session/session.service';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  private readonly logger = new Logger(JwtRefreshStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      // algorithms: ['RS256'],
    });
  }

  async validate(decoded: any) {
    const decodedUserId = decoded.sub;
    const decodedSessionId = decoded.sid;

    if (!decodedUserId || !decodedSessionId) {
      throw new UnauthorizedException();
    }

    const sessionData = await this.sessionService.getSession({ sessionId: decodedSessionId });

    if (!sessionData || !sessionData.user) {
      this.logger.debug(`Invalid token, session not found`, sessionData);
      throw new UnauthorizedException();
    }

    const reqUser = new RequestUser({
      id: sessionData.user.id,
      sessionId: sessionData.id,
      organisationId: sessionData.user.organisationId,
      activeTeamId: sessionData.user.activeTeamId,
      onboardedAt: sessionData.user.onboardedAt,
      roles: sessionData.user.roles,
      teams: sessionData.user.teams,
    });

    return {
      sessionData,
      ...reqUser,
    };
  }
}
