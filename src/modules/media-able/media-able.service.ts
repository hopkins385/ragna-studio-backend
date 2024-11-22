import { Injectable } from '@nestjs/common';
import { MediaAbleRepository } from './repositories/media-able.repository';
import { MediaAbleDto } from './dto/media-able.dto';
import { AttachMediaAbleDto } from './dto/attach-media-able.dto';
import { DetachMediaAbleDto } from './dto/detach-media-able.dto';

@Injectable()
export class MediaAbleService {
  constructor(private readonly mediaAbleRepo: MediaAbleRepository) {}

  attachTo(payload: AttachMediaAbleDto) {
    return this.mediaAbleRepo.prisma.mediaAbles.create({
      data: {
        mediaId: payload.mediaId,
        mediaAbleId: payload.model.id,
        mediaAbleType: payload.model.type,
        role: payload.role,
      },
    });
  }

  attachManyTo(payload: AttachMediaAbleDto[]) {
    return this.mediaAbleRepo.prisma.mediaAbles.createMany({
      data: payload.map((item) => ({
        mediaId: item.mediaId,
        mediaAbleId: item.model.id,
        mediaAbleType: item.model.type,
        role: item.role,
      })),
    });
  }

  async getMediaAbles(model: MediaAbleDto) {
    // 2. get the mediaAbles for the model
    const mediaAbles = await this.mediaAbleRepo.prisma.mediaAbles.findMany({
      select: {
        id: true,
        media: {
          select: {
            id: true,
            name: true,
            fileName: true,
            filePath: true,
            fileMime: true,
            fileSize: true,
          },
        },
      },
      where: {
        mediaAbleId: model.id,
        mediaAbleType: model.type,
      },
    });

    return mediaAbles;
  }

  async detachFrom(payload: DetachMediaAbleDto) {
    // 1. find the mediaAble based on the mediaAbleId
    const mediaAble = await this.mediaAbleRepo.prisma.mediaAbles.findFirst({
      select: {
        id: true,
      },
      where: {
        mediaAbleId: payload.model.id,
        mediaAbleType: payload.model.type,
      },
    });
    // 2. delete the mediaAble
    return await this.mediaAbleRepo.prisma.mediaAbles.delete({
      where: {
        id: mediaAble?.id,
      },
    });
  }

  softDelete(id: string) {
    return this.mediaAbleRepo.prisma.mediaAbles.update({
      where: {
        id: id.toLowerCase(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  delete(id: string) {
    return this.mediaAbleRepo.prisma.mediaAbles.delete({
      where: {
        id: id.toLowerCase(),
      },
    });
  }

  deleteManyMedia(id: string) {
    return this.mediaAbleRepo.prisma.mediaAbles.deleteMany({
      where: {
        mediaId: id.toLowerCase(),
      },
    });
  }
}
