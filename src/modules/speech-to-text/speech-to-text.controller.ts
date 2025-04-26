import { BaseController } from '@/common/controllers/base.controller';
import { audioFileValPipe } from '@/modules/speech-to-text/pipes/audio-file-validation.pipe';
import { FileUploaded } from '@/modules/upload/interfaces/file-uploaded.interface';
import {
  Controller,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeechToTextService } from './speech-to-text.service';

@Controller('speech-to-text')
export class SpeechToTextController extends BaseController {
  constructor(private readonly speechToTextService: SpeechToTextService) {
    super();
  }

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audioFile'))
  async createText(
    @UploadedFile(audioFileValPipe) audioFile: FileUploaded,
  ): Promise<{ text: string }> {
    if (!audioFile) {
      throw new UnprocessableEntityException('No audio file provided');
    }
    try {
      const text = await this.speechToTextService.transcribeAudio({ audioFile });
      return { text };
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
