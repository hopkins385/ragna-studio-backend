import { Injectable, Logger } from '@nestjs/common';
import { ProviderAuthService } from '../provider-auth/provider-auth.service';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { ProviderAuthDto } from '../provider-auth/dto/provider-auth.dto';
import {
  ProviderAuthName,
  ProviderAuthType,
} from '../provider-auth/interfaces/provider-auth.interface';

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private readonly oauth2Client: OAuth2Client;

  constructor(
    private readonly config: ConfigService,
    private readonly providerAuthService: ProviderAuthService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.config.getOrThrow('GOOGLE_CLIENT_ID'),
      this.config.getOrThrow('GOOGLE_CLIENT_SECRET'),
      this.config.getOrThrow('GOOGLE_DRIVE_REDIRECT_URL'),
    );
  }

  async getConsentURL() {
    const scopes = ['https://www.googleapis.com/auth/drive.readonly'];

    return new Promise((resolve, reject) => {
      const url = this.oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        prompt: 'consent',
        // If you only need one scope you can pass it as a string
        scope: scopes,
      });
      if (url) resolve(url);
      if (!url) reject('Failed to generate consent URL');
    });
  }

  async userHasAccessToken({
    userId,
    providerName,
    type,
  }: {
    userId: string;
    providerName: ProviderAuthName;
    type: ProviderAuthType;
  }): Promise<boolean> {
    const provider = await this.providerAuthService.findFirst({
      userId,
      providerName,
      type,
    });

    return !!provider?.accessToken;
  }

  async createAuthTokens(
    { userId }: { userId: string },
    { code }: { code: string },
  ) {
    const { tokens } = await this.oauth2Client.getToken(code);

    if (!tokens || !tokens.access_token) {
      throw new Error('Failed to get tokens');
    }

    const payload = ProviderAuthDto.fromInput({
      providerName: 'google',
      type: 'googledrive',
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? undefined,
    });

    const res = await this.providerAuthService.upsert(payload);

    if (!res) {
      throw new Error('Failed to store tokens');
    }

    return true;
  }

  async findData(
    { userId }: { userId: string },
    payload: {
      searchFileName: string;
      searchFolderId: string;
      pageToken: string;
    },
  ) {
    const provider = await this.providerAuthService.findFirst({
      userId,
      providerName: 'google',
      type: 'googledrive',
    });

    if (!provider || !provider?.accessToken || !provider?.refreshToken) {
      throw new Error('Google Drive is not connected');
    }

    this.oauth2Client.on(
      'tokens',
      async (tokens) => await this.onTokens(tokens, userId),
    );

    this.oauth2Client.setCredentials({
      access_token: provider.accessToken,
      refresh_token: provider.refreshToken,
    });

    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

    const result = await drive.files.list({
      q: this.getSearchQuery(payload.searchFileName, payload.searchFolderId),
      pageToken: payload.pageToken,
      orderBy: 'folder, name_natural asc',
      pageSize: 20,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size)',
      spaces: 'drive',
    });

    this.oauth2Client.removeAllListeners('tokens');

    return result.data;
  }

  // helpers

  async onTokens(tokens: any, userId: string) {
    if (tokens && tokens.access_token) {
      this.logger.debug('Received new access token');
      // save the new access token
      const payload = ProviderAuthDto.fromInput({
        providerName: 'google',
        type: 'googledrive',
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? undefined,
      });
      await this.providerAuthService.update(payload);
    }
  }

  getSearchQuery(fileName: string, folderId: string) {
    const query = `mimeType='application/vnd.google-apps.folder' and "root" in parents`;
    if (fileName !== '') {
      return `name contains "${fileName}"`;
    } else if (folderId !== '') {
      return `"${folderId}" in parents`;
    } else {
      return query + ' and trashed=false';
    }
  }
}
