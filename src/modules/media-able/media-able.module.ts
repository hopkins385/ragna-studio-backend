import { MediaAbleRepository } from './repositories/media-able.repository';
import { Module } from '@nestjs/common';
import { MediaAbleService } from './media-able.service';

@Module({
  providers: [MediaAbleRepository, MediaAbleService],
  exports: [MediaAbleService],
})
export class MediaAbleModule {}
