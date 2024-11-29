import { TextToImageRepository } from './repositories/text-to-image.repository';
import { Module } from '@nestjs/common';
import { TextToImageService } from './text-to-image.service';
import { TextToImageController } from './text-to-image.controller';
import { FluxImageGenerator } from './utils/flux-image';
import { StorageService } from '@/modules/storage/storage.service';
import { BullModule } from '@nestjs/bullmq';
import { ImageConversionProcessor } from './processors/image-conversion.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'image-conversion',
    }),
  ],
  controllers: [TextToImageController],
  providers: [
    TextToImageRepository,
    TextToImageService,
    FluxImageGenerator,
    StorageService,
    // Processors
    ImageConversionProcessor,
  ],
})
export class TextToImageModule {}
