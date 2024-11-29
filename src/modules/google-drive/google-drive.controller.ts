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
import { GoogleDriveQuery } from './dto/google-drive-query.dto';

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
  async callback(@ReqUser() user: UserEntity, @Query('code') code: string) {
    // TODO: validation of query params
    try {
      await this.googleDriveService.createAuthTokens(
        { userId: user.id },
        {
          code,
        },
      );
      return { status: 'Google Drive connected' };
    } catch (error) {
      throw new NotFoundException('Resource not found');
    }
  }

  @Get('has-access')
  async hasAccess(@ReqUser() user: UserEntity) {
    // TODO: validation of query params
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
    @Query() query: GoogleDriveQuery,
  ) {
    // TODO: validation of query params
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
