import { CustomFileTypeValidator } from '@/modules/upload/validations/file-type.validator';
import { HttpStatus, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

// OpenAI: File uploads are currently limited to 25 MB, and the following input file types are supported: mp3, mp4, mpeg, mpga, m4a, wav, and webm.

const ALLOWED_AUDIO_FILE_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm'];

export const audioFileValPipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 25 * 1000 * 1000 }), // 25 MB
    new CustomFileTypeValidator({ fileTypes: ALLOWED_AUDIO_FILE_TYPES }),
  ],
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
});
