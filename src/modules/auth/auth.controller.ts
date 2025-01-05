import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { AuthService, TokenResponse } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request } from 'express';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RefreshJwtGuard } from './guards/refresh-jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { CredentialsDto } from './dto/credentials.dto';
import { UseZodGuard } from 'nestjs-zod';
import { AuthGoogleService } from './google/auth-google.service';
import { SocialAuthProviderParam } from './google/social-auth-provider.param';
import { GoogleAuthCallbackBody } from './google/google-auth-callback-body.dto';
import { RegisterUserBody } from './dto/register-user-body.dto';
import { SessionService } from '@/modules/session/session.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly googleService: AuthGoogleService,
    private readonly sessionService: SessionService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @UseZodGuard('body', CredentialsDto)
  async login(@Req() req: Request): Promise<TokenResponse> {
    // @ts-ignore
    const userId = req.user.id;
    // @ts-ignore
    const userName = req.user.name;
    try {
      const sessionPayload = { user: { id: userId } };
      const sessionId = await this.sessionService.createSession({
        payload: sessionPayload,
      });

      this.logger.debug(`Created session: ${sessionId}`);

      const authUser = {
        id: userId,
        name: userName,
        sessionId,
      };
      const tokens = await this.authService.createTokensForUser(authUser);
      if (!tokens) {
        throw new Error('Failed to generate tokens');
      }
      return tokens;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RefreshJwtGuard)
  async refreshTokens(@ReqUser() user: UserEntity): Promise<TokenResponse> {
    //@ts-ignore
    const { id: userId, name: username, sessionId } = user;

    try {
      const sessionData = await this.sessionService.getSession(sessionId);

      if (!sessionData) {
        throw new UnauthorizedException();
      }

      this.logger.debug(`Session data: ${JSON.stringify(sessionData)}`);

      const tokens = await this.authService.refreshTokens({
        userId,
        username,
        sessionId,
      });

      if (!tokens) {
        throw new Error('Failed to generate tokens');
      }

      return tokens;
      //
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@ReqUser() user: UserEntity) {
    //@ts-ignore
    const sessionId = user.sessionId;
    const result = await this.sessionService.deleteSession(sessionId);
    return { message: 'Successfully logged out' };
  }

  @Public()
  @Post('/google/callback')
  async googleCallback(@Body() body: GoogleAuthCallbackBody) {
    try {
      const response = await this.googleService.getAccessToken(body.code);

      const profile = await this.googleService.getProfileByToken(
        response.tokens.id_token,
      );

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

  @Post('/register')
  async register(@Body() body: RegisterUserBody) {
    // needs invite token
    const validToken = await this.authService.validateInviteToken(
      body.invitationCode,
    );

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
  }

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
}
