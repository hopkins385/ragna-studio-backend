import { MediaService } from '@/modules/media/media.service';
import { StorageService } from '@/modules/storage/storage.service';
import { Injectable, Logger } from '@nestjs/common';
import { UploadFileDto } from './dto/file-upload.dto';

// [fields, files] is a tuple returned by formidable.parse()

interface ParsedForm {
  files: Express.Multer.File[];
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService,
  ) {}

  isImage(file: Express.Multer.File) {
    return file.mimetype.includes('image');
  }

  async uploadFiles({ files }: ParsedForm, { userId, teamId }: { userId: string; teamId: string }) {
    try {
      const medias = [];
      let createMediaPayload: any;

      for (const file of files) {
        const uploadPayload = UploadFileDto.fromInput({
          file,
          userId,
          teamId,
        });

        if (this.isImage(file)) {
          createMediaPayload = await this.storageService.uploadFileToBucket(
            'images',
            uploadPayload,
          );
        } else {
          createMediaPayload = await this.storageService.uploadFile(uploadPayload);
        }

        const media = await this.mediaService.create(createMediaPayload);
        medias.push(media);
      }

      // return medias;
      return medias.map((media) => {
        return {
          id: media.id,
          path: media.filePath,
          name: media.name,
        };
      });
    } catch (error: any) {
      this.logger.error(`Error uploading file: ${error?.message}`);
      throw new Error('Error uploading file');
    }
  }
}
