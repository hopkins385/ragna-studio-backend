import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';
import { BullModule } from '@nestjs/bullmq';
import { AudioProcessor } from './processors/transpile-audio.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audio',
    }),
  ],
  controllers: [AudioController],
  providers: [AudioService], //  AudioProcessor
})
export class AudioModule {}
