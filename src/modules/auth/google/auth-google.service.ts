import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { SocialAuthResponseDto } from './social-auth-response.dto';
@Injectable()
export class AuthGoogleService {
  private google: OAuth2Client;

  constructor(private readonly config: ConfigService) {
    this.google = new OAuth2Client(
      this.config.get<string>('GOOGLE_CLIENT_ID'),
      this.config.get<string>('GOOGLE_CLIENT_SECRET'),
      this.config.get<string>('GOOGLE_AUTH_REDIRECT_URL'),
    );
  }

  async getAuthUrl(): Promise<string> {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return this.google.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      // redirect_uri: this.config.get<string>('GOOGLE_REDIRECT_URL'),
    });
  }

  async getAccessToken(code: string) {
    return this.google.getToken(code);
  }

  async getProfileByAccessToken(accessToken: string) {
    throw new Error('Method not implemented.');
  }

  async getProfileByToken(idToken: string): Promise<SocialAuthResponseDto> {
    try {
      const ticket = await this.google.verifyIdToken({
        idToken,
        audience: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      });

      const data = ticket.getPayload();

      if (!data) {
        throw new UnprocessableEntityException('Invalid token');
      }

      return {
        socialUserId: data.sub,
        email: data.email,
        name: data?.name,
        firstName: data?.given_name,
        lastName: data?.family_name,
      };
    } catch {
      throw new UnprocessableEntityException('Invalid token');
    }
  }
}
