import { CreateMediaAbleDto } from '@/modules/media-able/dto/create-media-able.dto';
import { MediaAbleDto } from '@/modules/media-able/dto/media-able.dto';
import { MediaAbleService } from '@/modules/media-able/media-able.service';
import { StorageService } from '@/modules/storage/storage.service';
import { Injectable, Logger } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediaRepository } from './repositories/media.repository';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

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
        filePath: true,
        fileMime: true,
        fileName: true,
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

  async findManyByMediaAbles({ mediaModels }: { mediaModels: MediaAbleDto[] }) {
    // Construct the OR conditions for the where clause
    const orConditions = mediaModels
      .map((model) => ({
        mediaAbleId: model.id,
        mediaAbleType: model.type,
      }))
      .filter(Boolean);

    // Fetch all media associated with any of the provided models in a single query
    const medias = await this.mediaRepo.prisma.media.findMany({
      select: {
        id: true,
        name: true,
        fileSize: true,
        filePath: true,
        fileMime: true,
        fileName: true,
        // Include mediaAbles to potentially map results back if needed,
        // or adjust the logic based on the desired return structure.
        // If you need to return results grouped by the input model like before,
        // further processing after fetching would be required.
        // mediaAbles: {
        //   select: {
        //     mediaAbleId: true,
        //     mediaAbleType: true,
        //   },
        //   where: {
        //     OR: orConditions,
        //   },
        // },
      },
      where: {
        mediaAbles: {
          some: {
            OR: orConditions,
          },
        },
        deletedAt: null,
      },
    });

    // Return the fetched media
    return medias.map((media) => ({
      id: media.id,
      name: media.name,
      fileSize: media.fileSize,
      filePath: media.filePath,
      fileMime: media.fileMime,
      fileName: media.fileName,
    }));
  }

  async findAllMediaFor({
    mediaModel,
    userMediaModel,
    page,
    limit = 10,
  }: {
    mediaModel: MediaAbleDto;
    userMediaModel: MediaAbleDto;
    page: number;
    limit: number;
  }) {
    // ensure models are not the same
    if (mediaModel.id === userMediaModel.id && mediaModel.type === userMediaModel.type) {
      throw new Error('Model and user model cannot be the same');
    }
    const [medias, meta] = await this.mediaRepo.prisma.media
      .paginate({
        select: {
          id: true,
          name: true,
          fileSize: true,
        },
        where: {
          mediaAbles: {
            some: {
              // Apply conditions to the related mediaAbles records
              OR: [
                {
                  mediaAbleId: mediaModel.id,
                  mediaAbleType: mediaModel.type,
                },
                // Check for the userModel's id and type together
                {
                  mediaAbleId: userMediaModel.id,
                  mediaAbleType: userMediaModel.type,
                },
              ],
              // This condition must also be met by the mediaAbles record found via 'some'
              deletedAt: null,
            },
          },
          // This condition applies to the main Media record
          deletedAt: null,
        },
      })
      .withPages({
        limit,
        page,
        includePageCount: true,
      });

    return { medias, meta };
  }

  async softDelete(mediaId: string) {
    // we just remove the connections between the media and the models
    return this.mediaAbleService.deleteManyMedia(mediaId);
  }

  async delete({ mediaId }: { mediaId: string }): Promise<boolean> {
    const media = await this.findFirst(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    const { filePath } = media;

    // is media local or remote?
    if (media.filePath.startsWith('http')) {
      await this.storageService.deleteFileFromBucket({ filePath });
    } else {
      await this.storageService.deleteFile({ filePath });
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
