import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @UseZodGuard('body', CredentialsDto)
  async login(@ReqUser() user: UserEntity): Promise<TokenResponse> {
    try {
      const tokens = await this.authService.login(user);
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
}
