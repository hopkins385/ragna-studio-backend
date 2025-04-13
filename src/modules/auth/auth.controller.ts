import { Public } from '@/common/decorators/public.decorator';
import { AuthUser } from '@/modules/auth/decorators/auth-user.decorator';
import { ResetPasswordBody } from '@/modules/auth/dto/reset-password-body.dto';
import { AuthUserEntity } from '@/modules/auth/entities/auth-user.entity';
import { Session } from '@/modules/session/decorators/session.decorator';
import { SessionData, SessionService } from '@/modules/session/session.service';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UseZodGuard } from 'nestjs-zod';
import { AuthService, TokenResponse } from './auth.service';
import { CredentialsDto } from './dto/credentials.dto';
import { AuthGoogleService } from './google/auth-google.service';
import { GoogleAuthCallbackBody } from './google/google-auth-callback-body.dto';
import { SocialAuthProviderParam } from './google/social-auth-provider.param';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly googleService: AuthGoogleService,
    private readonly sessionService: SessionService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60 * 1000 } })
  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseZodGuard('body', CredentialsDto)
  async login(
    @AuthUser() authUser: AuthUserEntity,
    @Session() session: SessionData,
  ): Promise<TokenResponse> {
    try {
      const tokens = await this.authService.createTokensForUser({
        id: authUser.id,
        sessionId: session.id,
      });
      if (!tokens) {
        throw new Error('Failed to generate tokens');
      }
      return tokens;
    } catch (error: unknown) {
      throw new UnauthorizedException();
    }
  }

  @Public()
  @Post('refresh')
  @UseGuards(RefreshJwtGuard)
  async refreshTokens(@ReqUser() reqUser: RequestUser): Promise<TokenResponse> {
    try {
      const tokens = await this.authService.refreshTokens({
        userId: reqUser.id,
        sessionId: reqUser.sessionId,
      });

      if (!tokens) {
        throw new Error('Failed to generate tokens');
      }

      // refresh session
      await this.sessionService.refreshSession({ sessionId: reqUser.sessionId });

      return tokens;
      //
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordBody) {
    try {
      const result = await this.authService.resetPassword({
        token: body.token,
        password: body.password,
      });
      if (!result) {
        throw new Error('Failed to reset password');
      }
      return { success: true };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Session() session: SessionData) {
    const result = await this.sessionService.deleteSession(session.id);
    return { message: 'Successfully logged out' };
  }

  // get current session
  @Get('session')
  async getSession(@Session() session: SessionData) {
    try {
      const sessionData = await this.sessionService.getSession(
        { sessionId: session.id },
        { refresh: true },
      );
      if (!sessionData) {
        throw new Error('Session not found');
      }

      return {
        user: sessionData.user,
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Public()
  @Post('/google/callback')
  async googleCallback(@Body() body: GoogleAuthCallbackBody) {
    try {
      const response = await this.googleService.getAccessToken(body.code);

      const profile = await this.googleService.getProfileByToken(response.tokens.id_token);

      const tokens = await this.authService.socialLogin(profile);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Public()
  @Get('/:provider/url')
  async googleAuthUrl(@Param() param: SocialAuthProviderParam) {
    switch (param.provider) {
      case 'google':
        const url = await this.googleService.getAuthUrl();
        return { url };
        break;
      default:
        throw new UnprocessableEntityException('Invalid provider');
    }
  }

  /*@Public()
  @Post('/register')
  async register(@Body() body: RegisterUserBody) {
    // needs invite token
    const validToken = await this.authService.validateInviteToken(body.invitationCode);

    if (!validToken) {
      throw new BadRequestException('Invalid token');
    }

    try {
      const result = await this.authService.register({
        name: body.name,
        email: body.email,
        password: body.password,
      });
      return { success: true };
      //
    } catch (error: any) {
      this.logger.error(error?.message);
      throw new InternalServerErrorException('Failed to register user');
    }
  }*/

  @Public()
  @Get('/confirm/email/:id/:token')
  async confirmEmail(@Param() params: any) {
    try {
      await this.authService.confirmEmail(params);
      return { success: true };
      //
    } catch (error: any) {
      this.logger.error(error?.message);
      throw new InternalServerErrorException('Failed to confirm email');
    }
  }

  @Get('/invite-token')
  async getInviteToken() {
    try {
      const token = await this.authService.generateInviteToken();
      return { token };
      //
    } catch (error: any) {
      this.logger.error(error?.message);
      throw new InternalServerErrorException('Failed to generate invite token');
    }
  }
}
