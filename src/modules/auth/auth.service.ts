import { UserService } from '@/modules/user/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { comparePassword } from 'src/common/utils/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User as UserModel } from '@prisma/client';
import { CredentialsDto } from './dto/credentials.dto';
import { SocialAuthResponseDto } from './google/social-auth-response.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueueName } from '@/modules/queue/enums/queue-name.enum';

interface UserPayload {
  userId: string;
  username: string;
  sessionId: string;
}

interface TokenPayload {
  sub: string;
  iss: string;
  sid: string;
}

export interface TokenResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectQueue(QueueName.EMAIL)
    private readonly emailQueue: Queue,
  ) {}

  async updateLastLogin({ userId }: { userId: string }): Promise<void> {
    await this.userService.updateLastLogin(userId);
  }

  async validateUser({
    email,
    password,
  }: CredentialsDto): Promise<Partial<UserModel> | null> {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.password || !user.password.length) return null;

    const isValidPassword = await comparePassword(password, user.password);
    return isValidPassword ? user : null;
  }

  async createTokensForUser(user: {
    id: string;
    name: string;
    sessionId: string;
  }): Promise<TokenResponse | null> {
    if (!user) {
      throw new Error('User not found');
    }

    const payload: UserPayload = {
      userId: user.id,
      username: user.name,
      sessionId: user.sessionId,
    };

    try {
      return await this.generateTokens(payload);
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      return null;
    }
  }

  async refreshTokens(payload: UserPayload): Promise<TokenResponse | null> {
    try {
      return await this.generateTokens(payload);
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      return null;
    }
  }

  async generateAccessToken(payload: UserPayload): Promise<string> {
    const tokenPayload: TokenPayload = {
      sub: payload.userId,
      iss: this.configService.get<string>('JWT_ISSUER', 'https://api.ragna.io'),
      sid: payload.sessionId,
    };

    return this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
      // algorithm: 'RS256',
    });
  }

  async generateRefreshToken(payload: UserPayload): Promise<string> {
    const tokenPayload: TokenPayload = {
      sub: payload.userId,
      iss: this.configService.get<string>('JWT_ISSUER', 'https://api.ragna.io'),
      sid: payload.sessionId,
    };
    return this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      // algorithm: 'RS256',
    });
  }

  async generateInviteToken(): Promise<string> {
    const payload = { iss: 'https://api.ragna.io' };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_INVITE_SECRET'),
      expiresIn: this.configService.get<string>('JWT_INVITE_EXPIRES_IN'),
      // algorithm: 'RS256',
    });
  }

  async validateInviteToken(token: string): Promise<{ sub: string }> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_INVITE_SECRET'),
    });
  }

  private async generateTokens(payload: UserPayload): Promise<TokenResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    const accessTokenExpiresAt = this.jwtService.decode(accessToken).exp;
    const refreshTokenExpiresAt = this.jwtService.decode(refreshToken).exp;

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    };
  }

  async socialLogin(socialAuth: SocialAuthResponseDto): Promise<TokenResponse> {
    let user = await this.userService.findByEmail(socialAuth.email);
    if (!user) {
      if (
        !socialAuth?.firstName &&
        !socialAuth?.lastName &&
        !socialAuth?.name
      ) {
        throw new Error('Username required');
      }
      const userName =
        socialAuth?.name ?? `${socialAuth?.firstName} ${socialAuth?.lastName}`;
      user = await this.userService.createWithoutPassword({
        email: socialAuth.email,
        name: userName,
      });
    }
    return this.generateTokens({
      userId: user.id,
      username: user.name,
      sessionId: 'session.id',
    });
  }

  async register(payload: { email: string; name: string; password: string }) {
    const existingUser = await this.userService.findByEmail(payload.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser = await this.userService.create({
      email: payload.email,
      name: payload.name,
      password: payload.password,
    });

    /*const token = await this.createEmailVerificationToken({ sub: newUser.id });
    const job = await this.emailQueue.add('confirmation', {
      userId: newUser.id,
      firstName: newUser.firstName,
      email: newUser.email,
      token,
    });
    */

    return { jobId: 'job.id' };
  }

  async confirmEmail(payload: any) {
    throw new Error('Method not implemented.');
    /*
    const { sub } = await this.verifyEmailVerificationToken(payload.token);
    if (sub !== payload.id) {
      throw new UnprocessableEntityException('Invalid token');
    }
    const user = await this.userService.findOneById(sub);
    if (!user) {
      throw new UnprocessableEntityException('User not found');
    }
    if (user.emailVerifiedAt !== null) {
      return true;
    }
    user.emailVerifiedAt = new Date();
    user.isActive = true;
    await this.userService.update(user.id, user);
    return true;
    // return this.getTokens(user.id, user.name);
    */
  }
}
