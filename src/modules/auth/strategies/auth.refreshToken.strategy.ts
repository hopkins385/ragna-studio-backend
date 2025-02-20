import { SessionService } from '@/modules/session/session.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private readonly logger = new Logger(JwtRefreshStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   JwtRefreshStrategy.extractJWTFromCookie,
      //   ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ]),
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

    const sessionData = await this.sessionService.getSession(decodedSessionId);

    if (!sessionData || !sessionData.user) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne({
      userId: sessionData.user.id,
    });

    if (!user || user.id !== decodedUserId) {
      throw new UnauthorizedException();
    }

    return {
      sessionId: decodedSessionId,
      ...user,
    };
  }

  private static extractJWTFromCookie(req: Request): string | null {
    if (
      req.cookies &&
      'HOST-ragna.token' in req.cookies &&
      req.cookies['HOST-ragna.token'].length > 0
    ) {
      return req.cookies['HOST-ragna.token'];
    }
    return null;
  }
}
