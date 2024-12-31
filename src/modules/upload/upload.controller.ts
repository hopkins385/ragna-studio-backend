import {
  Controller,
  FileTypeValidator,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ACCEPTED_FILE_TYPES_REGEXP } from './validations/file-allowed-list';
import { FilesCountValidator } from './validations/file-size.validation';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFile(
    @ReqUser() user: UserEntity,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FilesCountValidator({ maxCount: 2 }),
          new FileTypeValidator({ fileType: ACCEPTED_FILE_TYPES_REGEXP }),
          new MaxFileSizeValidator({ maxSize: 15 * 1000 * 1000 }),
        ],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    files: Express.Multer.File[],
  ) {
    try {
      return await this.uploadService.uploadFiles({ files }, user);
    } catch (error: any) {
      this.logger.error(`Error uploading file: ${error?.message}`);
      throw new InternalServerErrorException('Error uploading file');
    }
  }
}
