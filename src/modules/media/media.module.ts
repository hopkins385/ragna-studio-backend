import { MediaRepository } from './repositories/media.repository';
import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaAbleModule } from '../media-able/media-able.module';
import { StorageService } from '../storage/storage.service';

@Module({
  imports: [MediaAbleModule],
  controllers: [MediaController],
  providers: [MediaRepository, MediaService, StorageService],
  exports: [MediaService, StorageService],
})
export class MediaModule {}
