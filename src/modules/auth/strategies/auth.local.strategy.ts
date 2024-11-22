import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { CredentialsDto } from '../dto/credentials.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<Partial<UserEntity>> {
    const payload = new CredentialsDto();
    payload.email = email;
    payload.password = password;
    try {
      const randomBetween300and800 = Math.floor(Math.random() * 500) + 300;
      await new Promise((resolve) =>
        setTimeout(resolve, randomBetween300and800),
      );

      const user = await this.authService.validateUser(payload);
      if (!user) {
        throw new Error('User not found');
      }

      return { id: user.id, email: user.email, name: user.name };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
