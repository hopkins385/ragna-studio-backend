import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Query,
  Logger,
} from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { GoogleDriveCodeQuery } from './dto/google-drive-code-query.dto';
import { GoogleDriveSearchQuery } from './dto/google-drive-search-query.dto';

@Controller('google-drive')
export class GoogleDriveController {
  private readonly logger = new Logger(GoogleDriveController.name);

  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Get('consent-url')
  async getConsentURL() {
    try {
      const url = await this.googleDriveService.getConsentURL();
      return { url };
    } catch (error) {
      throw new NotFoundException('Resource not found');
    }
  }

  @Get('callback')
  async callback(
    @ReqUser() user: UserEntity,
    @Query() query: GoogleDriveCodeQuery,
  ) {
    try {
      await this.googleDriveService.createAuthTokens(
        { userId: user.id },
        {
          code: query.code,
        },
      );
      return { status: 'Google Drive connected' };
    } catch (error) {
      throw new NotFoundException('Resource not found');
    }
  }

  @Get('has-access')
  async hasAccess(@ReqUser() user: UserEntity) {
    try {
      const value = await this.googleDriveService.userHasAccessToken({
        userId: user.id,
        providerName: 'google',
        type: 'googledrive',
      });
      return { hasAccess: value };
    } catch (error) {
      throw new NotFoundException('Resource not found');
    }
  }

  @Get()
  async findData(
    @ReqUser() user: UserEntity,
    @Query() query: GoogleDriveSearchQuery,
  ) {
    try {
      const data = await this.googleDriveService.findData(
        { userId: user.id },
        {
          searchFileName: query.searchFileName ?? '',
          searchFolderId: query.searchFolderId ?? '',
          pageToken: query.pageToken ?? '',
        },
      );
      return { nextPageToken: data.nextPageToken, files: data.files };
    } catch (error: any) {
      this.logger.error(`Failed to find data: ${error?.message}`);
      throw new NotFoundException('Resource not found');
    }
  }
}
