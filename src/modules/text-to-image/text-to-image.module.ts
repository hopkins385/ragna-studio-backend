import { TextToImageRepository } from './repositories/text-to-image.repository';
import { Module } from '@nestjs/common';
import { TextToImageService } from './text-to-image.service';
import { TextToImageController } from './text-to-image.controller';
import { FluxImageGenerator } from './utils/flux-image';
import { StorageService } from '../storage/storage.service';

@Module({
  controllers: [TextToImageController],
  providers: [
    TextToImageRepository,
    TextToImageService,
    FluxImageGenerator,
    StorageService,
  ],
})
export class TextToImageModule {}
