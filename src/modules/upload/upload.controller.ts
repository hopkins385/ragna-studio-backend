import { BaseController } from '@/common/controllers/base.controller';
import { FileUploaded } from '@/modules/upload/interfaces/file-uploaded.interface';
import { filesValidationPipe } from '@/modules/upload/pipes/file-validation.pipe';
import { ReqUser } from '@/modules/user/decorators/user.decorator';
import { RequestUser } from '@/modules/user/entities/request-user.entity';
import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController extends BaseController {
  constructor(private readonly uploadService: UploadService) {
    super();
  }

  @Post()
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFile(
    @ReqUser() reqUser: RequestUser,
    @UploadedFiles(filesValidationPipe) files: FileUploaded[],
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
