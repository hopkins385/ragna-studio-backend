import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MediaModule } from './../media/media.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './temp',
      }),
    }),
    MediaModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
