import { Module } from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';
import { SpeechToTextController } from './speech-to-text.controller';

@Module({
  controllers: [SpeechToTextController],
  providers: [SpeechToTextService],
})
export class SpeechToTextModule {}
