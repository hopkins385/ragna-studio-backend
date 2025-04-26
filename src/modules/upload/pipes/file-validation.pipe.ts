import { ACCEPTED_FILE_TYPES_ARRAY } from '@/modules/upload/validations/file-allowed-list';
import { FilesCountValidator } from '@/modules/upload/validations/file-size.validation';
import { CustomFileTypeValidator } from '@/modules/upload/validations/file-type.validator';
import { HttpStatus, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

export const filesValidationPipe = new ParseFilePipe({
  validators: [
    new FilesCountValidator({ maxCount: 10 }),
    new CustomFileTypeValidator({ fileTypes: ACCEPTED_FILE_TYPES_ARRAY }),
    new MaxFileSizeValidator({ maxSize: 15 * 1000 * 1000 }),
  ],
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
});
