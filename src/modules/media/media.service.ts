import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediaRepository } from './repositories/media.repository';
import { StorageService } from '@/modules/storage/storage.service';
import { MediaAbleService } from '@/modules/media-able/media-able.service';
import { CreateMediaAbleDto } from '@/modules/media-able/dto/create-media-able.dto';
import { MediaAbleDto } from '@/modules/media-able/dto/media-able.dto';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepo: MediaRepository,
    private readonly mediaAbleService: MediaAbleService,
    private readonly storageService: StorageService,
  ) {}

  async create(payload: CreateMediaDto) {
    const media = await this.mediaRepo.prisma.media.create({
      data: {
        teamId: payload.teamId,
        name: payload.name,
        fileName: payload.fileName,
        filePath: payload.filePath,
        fileMime: payload.fileMime,
        fileSize: payload.fileSize,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // create the owner mediaAble (typically the user who uploaded the media)
    const mediaAblePayload = CreateMediaAbleDto.fromInput({
      mediaId: media.id,
      mediaAbleId: payload.model.id,
      mediaAbleType: payload.model.type,
      role: 'owner',
    });

    const mediaAble = await this.mediaAbleService.attachTo(mediaAblePayload);

    return media;
  }

  async findFirst(mediaId: string) {
    return this.mediaRepo.prisma.media.findFirst({
      where: {
        id: mediaId.toLowerCase(),
      },
    });
  }

  async findAllFor(model: MediaAbleDto) {
    return this.mediaRepo.prisma.media.findMany({
      select: {
        id: true,
        name: true,
        fileSize: true,
      },
      where: {
        mediaAbles: {
          some: {
            mediaAbleId: model.id,
            mediaAbleType: model.type,
          },
        },
        deletedAt: null,
      },
    });
  }

  async paginateFindAllFor(
    model: MediaAbleDto,
    page: number,
    limit: number = 10,
  ) {
    return this.mediaRepo.prisma.media
      .paginate({
        select: {
          id: true,
          name: true,
          fileSize: true,
        },
        where: {
          mediaAbles: {
            some: {
              mediaAbleId: model.id,
              mediaAbleType: model.type,
              deletedAt: null,
            },
          },
          deletedAt: null,
        },
      })
      .withPages({
        limit,
        page,
        includePageCount: true,
      });
  }

  async softDelete(mediaId: string) {
    // we just remove the connections between the media and the models
    return this.mediaAbleService.deleteManyMedia(mediaId);
  }

  async delete({
    userId,
    mediaId,
  }: {
    userId: string;
    mediaId: string;
  }): Promise<boolean> {
    const media = await this.findFirst(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    // is media local or remote?
    if (media.filePath.startsWith('http')) {
      await this.storageService.deleteFileFromBucket(media.filePath);
    } else {
      await this.storageService.deleteFile(userId, media.fileName);
    }

    await this.mediaRepo.prisma.$transaction([
      // we remove the connections between the media and the models
      this.mediaRepo.prisma.mediaAbles.deleteMany({
        where: {
          mediaId: media.id,
        },
      }),
      // then we remove the media
      this.mediaRepo.prisma.media.delete({
        where: {
          id: media.id,
        },
      }),
    ]);

    return true;
  }
}
