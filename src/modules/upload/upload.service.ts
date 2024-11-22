import { Injectable } from '@nestjs/common';
import type { Options as FormidableOptions } from 'formidable';
import formidable from 'formidable';
import { Request } from 'express';
import { UploadFileDto } from './dto/file-upload.dto';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { StorageService } from '@/modules/storage/storage.service';
import { MediaService } from '@/modules/media/media.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService,
  ) {}

  async uploadFiles(req: Request, user: UserEntity) {
    const options = {
      includeFields: true,
      multiples: true,
      maxFiles: 10,
      maxFilesSize: 5 * 1024 * 1024,
      maxFields: 8,
      // TODO: add filter for file types
      // filter: ({ name, originalFilename, mimetype }) => {
      //   return mimetype && (mimetype.includes('pdf') || mimetype.includes('plain'));
      // },
    } as FormidableOptions;

    const form = formidable(options);

    const [fields, files] = await form.parse(req);

    //if vision then store external
    const vision = Boolean(fields.vision?.[0] === 'true');

    const medias = [];
    let createMediaPayload: any;

    for (const file of files.clientFiles) {
      const uploadPayload = UploadFileDto.fromInput({
        file,
        userId: user.id,
        teamId: user.teams[0].team.id,
      });

      if (vision) {
        createMediaPayload = await this.storageService.uploadFileToBucket(
          'images',
          uploadPayload,
        );
      } else {
        createMediaPayload =
          await this.storageService.uploadFile(uploadPayload);
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
  }
}
