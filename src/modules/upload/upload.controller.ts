import {
  Controller,
  InternalServerErrorException,
  Post,
  Req,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { Request, Response } from 'express';
import { ReqUser } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  async uploadFile(@ReqUser() user: UserEntity, @Req() req: Request) {
    try {
      return await this.uploadService.uploadFiles(req, user);
    } catch (error) {
      throw new InternalServerErrorException('Error uploading file');
    }
  }
}
