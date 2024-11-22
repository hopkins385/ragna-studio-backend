import { MediaModule } from './../media/media.module';
import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [MediaModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
