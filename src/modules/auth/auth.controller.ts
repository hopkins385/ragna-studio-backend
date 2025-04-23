import { BaseController } from '@/common/controllers/base.controller';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthUser } from '@/modules/auth/decorators/auth-user.decorator';
import { RegisterUserBody } from '@/modules/auth/dto/register-user-body.dto';
import { ResetPasswordBody } from '@/modules/auth/dto/reset-password-body.dto';
import { AuthUserEntity } from '@/modules/auth/entities/auth-user.entity';
import { Session } from '@/modules/session/decorators/session.decorator';
import { SessionData, SessionService } from '@/modules/session/session.service';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Role } from '@/modules/user/enums/role.enum';
import { RolesGuard } from '@/modules/user/guards/roles.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UseZodGuard } from 'nestjs-zod';
import { AuthService, TokenResponse } from './auth.service';
import { CredentialsDto } from './dto/credentials.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt-auth.guard';

@Controller('auth')
export class AuthController extends BaseController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {
    super();
  }

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
      return tokens;
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Throttle({ default: { limit: 5, ttl: 60 * 1000 } })
  @Public()
  @Post('/register')
  async register(@Body() body: RegisterUserBody) {
    // needs invite token
    const validToken = await this.authService.validateInviteToken({ token: body.invitationCode });
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
    } catch (error: unknown) {
      this.handleError(error);
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
      return tokens;
    } catch (error) {
      this.handleError(error);
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
      return { success: true };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Session() session: SessionData) {
    try {
      const result = await this.sessionService.deleteSession({ sessionId: session.id });
      return { success: true };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  // get current session
  @Get('session')
  async getSession(@Session() session: SessionData) {
    try {
      const sessionData = await this.sessionService.getSession(
        { sessionId: session.id },
        { extend: true },
      );
      return {
        user: sessionData.user,
      };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get('/invite-token')
  @UseGuards(RolesGuard)
  @Roles(Role.PLATFORM_OWNER)
  async getInviteToken() {
    try {
      const token = await this.authService.generateInviteToken();
      return { token };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  // @Public()
  // @Get('/confirm/email/:id/:token')
  // async confirmEmail(@Param() params: any) {
  //   try {
  //     await this.authService.confirmEmail(params);
  //     return { success: true };
  //   } catch (error: unknown) {
  //     this.handleError(error);
  //   }
  // }

  // @Public()
  // @Post('/google/callback')
  // async googleCallback(@Body() body: GoogleAuthCallbackBody) {
  //   try {
  //     const response = await this.googleService.getAccessToken(body.code);
  //     const profile = await this.googleService.getProfileByToken(response.tokens.id_token);
  //     const tokens = await this.authService.socialLogin(profile);
  //     return tokens;
  //   } catch (error: unknown) {
  //     this.handleError(error);
  //   }
  // }

  // @Public()
  // @Get('/:provider/url')
  // async googleAuthUrl(@Param() param: SocialAuthProviderParam) {
  //   switch (param.provider) {
  //     case 'google':
  //       const url = await this.googleService.getAuthUrl();
  //       return { url };
  //       break;
  //     default:
  //       throw new UnprocessableEntityException('Invalid provider');
  //   }
  // }
}
