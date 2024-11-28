import { Module } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';
import { GoogleDriveController } from './google-drive.controller';
import { ProviderAuthModule } from '../provider-auth/provider-auth.module';

@Module({
  imports: [ProviderAuthModule],
  controllers: [GoogleDriveController],
  providers: [GoogleDriveService],
})
export class GoogleDriveModule {}
