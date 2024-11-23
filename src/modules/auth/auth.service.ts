import { UserService } from '@/modules/user/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { comparePassword, hashPassword } from 'src/common/utils/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User as UserModel } from '@prisma/client';
import { CredentialsDto } from './dto/credentials.dto';
import { randomBytes } from 'crypto';
import { SocialAuthResponseDto } from './google/social-auth-response.dto';

interface UserPayload {
  userId: string;
  username: string;
}

interface TokenPayload {
  sub: string;
  username: string;
}

export interface TokenResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}

const logger = new Logger('AuthService');

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser({
    email,
    password,
  }: CredentialsDto): Promise<Partial<UserModel> | null> {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.password || !user.password.length) return null;

    const isValidPassword = await comparePassword(password, user.password);
    return isValidPassword ? user : null;
  }

  async login(user: UserModel): Promise<TokenResponse | null> {
    if (!user) {
      throw new Error('User not found');
    }

    const payload: UserPayload = {
      userId: user.id,
      username: user.name,
    };

    try {
      return await this.generateTokens(payload);
    } catch (error) {
      logger.error('Error:', error);
      return null;
    }
  }

  async refreshTokens(payload: UserPayload): Promise<TokenResponse | null> {
    try {
      return await this.generateTokens(payload);
    } catch (error) {
      logger.error('Error:', error);
      return null;
    }
  }

  generateAccessToken(payload: UserPayload): Promise<string> {
    const tokenPayload: TokenPayload = {
      sub: payload.userId,
      username: payload.username,
    };

    return this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });
  }

  generateRefreshToken(payload: UserPayload): Promise<string> {
    return this.jwtService.signAsync(
      { sub: payload.userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      },
    );
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
    return this.generateTokens({ userId: user.id, username: user.name });
  }
}
