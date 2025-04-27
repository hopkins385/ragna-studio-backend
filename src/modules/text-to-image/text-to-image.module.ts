import { QueueName } from '@/modules/queue/enums/queue-name.enum';
import { StorageService } from '@/modules/storage/storage.service';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ImageConversionProcessor } from './processors/image-conversion.processor';
import { TextToImageRepository } from './repositories/text-to-image.repository';
import { TextToImageController } from './text-to-image.controller';
import { TextToImageService } from './text-to-image.service';
import { FluxImageGenerator } from './utils/flux-image';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.IMAGE_CONVERSION,
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
