import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: AuthGoogleService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @UseZodGuard('body', CredentialsDto)
  async login(@Req() req: Request): Promise<TokenResponse> {
    try {
      // @ts-ignore
      const authUser = { id: req.user.id, name: req.user.name }; // TODO: fix typing
      const tokens = await this.authService.createTokensForUser(authUser);
      if (!tokens) {
        throw new Error('Failed to generate tokens');
      }
      return tokens;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RefreshJwtGuard)
  async refreshTokens(@ReqUser() user: UserEntity): Promise<TokenResponse> {
    const { id: userId, name: username } = user;
    try {
      const tokens = await this.authService.refreshTokens({ userId, username });
      if (!tokens) {
        throw new Error('Failed to generate tokens');
      }
      return tokens;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    return { message: 'Successfully logged out' };
  }

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
}
