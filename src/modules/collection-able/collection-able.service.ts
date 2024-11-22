import { Injectable } from '@nestjs/common';
import { CollectionAbleRepository } from './repositories/collection-able.repository';
import { DetachCollectionAbleDto } from './dto/detach-collection-able.dto';
import { DetachAllCollectionAbleDto } from './dto/detach-all-collection-able.dto';
import { AttachCollectionAbleDto } from './dto/attach-collection-able.dto';

@Injectable()
export class CollectionAbleService {
  constructor(private readonly collectionAbleRepo: CollectionAbleRepository) {}

  async attachTo(payload: AttachCollectionAbleDto) {
    return this.collectionAbleRepo.prisma.collectionAble.create({
      data: {
        collectionId: payload.collectionId,
        collectionAbleId: payload.model.id,
        collectionAbleType: payload.model.type,
      },
    });
  }

  async detachFrom(payload: DetachCollectionAbleDto) {
    const collectionAble =
      await this.collectionAbleRepo.prisma.collectionAble.findFirst({
        where: {
          collectionId: payload.collectionId,
          collectionAbleId: payload.model.id,
          collectionAbleType: payload.model.type,
        },
      });

    if (!collectionAble) {
      throw new Error('CollectionAble not found');
    }

    return this.collectionAbleRepo.prisma.collectionAble.delete({
      where: {
        id: collectionAble.id,
        collectionId: payload.collectionId,
        collectionAbleId: payload.model.id,
        collectionAbleType: payload.model.type,
      },
    });
  }

  async detachAllFrom(payload: DetachAllCollectionAbleDto) {
    return this.collectionAbleRepo.prisma.collectionAble.deleteMany({
      where: {
        collectionAbleId: payload.model.id,
        collectionAbleType: payload.model.type,
      },
    });
  }

  // only one collectionAble per model
  async replaceTo(payload: AttachCollectionAbleDto) {
    const all = await this.collectionAbleRepo.prisma.collectionAble.findMany({
      where: {
        collectionAbleId: payload.model.id,
        collectionAbleType: payload.model.type,
      },
    });

    if (all.length) {
      await this.collectionAbleRepo.prisma.collectionAble.deleteMany({
        where: {
          id: {
            in: all.map((item) => item.id),
          },
        },
      });
    }

    return this.attachTo(payload);
  }
}
