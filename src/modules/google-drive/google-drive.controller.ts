import { BaseController } from '@/common/controllers/base.controller';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Controller, Get, Query } from '@nestjs/common';
import { ReqUser } from '../user/decorators/user.decorator';
import { GoogleDriveCodeQuery } from './dto/google-drive-code-query.dto';
import { GoogleDriveSearchQuery } from './dto/google-drive-search-query.dto';
import { GoogleDriveService } from './google-drive.service';

@Controller('google-drive')
export class GoogleDriveController extends BaseController {
  constructor(private readonly googleDriveService: GoogleDriveService) {
    super();
  }

  @Get('consent-url')
  async getConsentURL() {
    try {
      const url = await this.googleDriveService.getConsentURL();
      return { url };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get('callback')
  async callback(@ReqUser() reqUser: RequestUser, @Query() query: GoogleDriveCodeQuery) {
    try {
      await this.googleDriveService.createAuthTokens(
        { userId: reqUser.id },
        {
          code: query.code,
        },
      );
      return { status: 'Google Drive connected' };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get('has-access')
  async hasAccess(@ReqUser() reqUser: RequestUser) {
    try {
      const value = await this.googleDriveService.userHasAccessToken({
        userId: reqUser.id,
        providerName: 'google',
        type: 'googledrive',
      });
      return { hasAccess: value };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  @Get()
  async findData(@ReqUser() reqUser: RequestUser, @Query() query: GoogleDriveSearchQuery) {
    try {
      const data = await this.googleDriveService.findData(
        { userId: reqUser.id },
        {
          searchFileName: query.searchFileName ?? '',
          searchFolderId: query.searchFolderId ?? '',
          pageToken: query.pageToken ?? '',
        },
      );
      return { nextPageToken: data.nextPageToken, files: data.files };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
