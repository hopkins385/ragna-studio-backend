import { BaseController } from '@/common/controllers/base.controller';
import { ACCEPTED_FILE_TYPES_ARRAY } from '@/modules/upload/validations/file-allowed-list';
import { CustomFileTypeValidator } from '@/modules/upload/validations/file-type.validator';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import {
  Controller,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { FilesCountValidator } from './validations/file-size.validation';

@Controller('upload')
export class UploadController extends BaseController {
  constructor(private readonly uploadService: UploadService) {
    super();
  }

  @Post()
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFile(
    @ReqUser() reqUser: RequestUser,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FilesCountValidator({ maxCount: 10 }),
          new CustomFileTypeValidator({ fileTypes: ACCEPTED_FILE_TYPES_ARRAY }),
          new MaxFileSizeValidator({ maxSize: 15 * 1000 * 1000 }),
        ],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    files: Express.Multer.File[],
  ) {
    try {
      return await this.uploadService.uploadFiles(
        { files },
        { userId: reqUser.id, teamId: reqUser.activeTeamId },
      );
    } catch (error: unknown) {
      this.handleError(error);
    }
  }
}
