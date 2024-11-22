import { Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CollectionRepository } from './repositories/collection.repository';
import { CollectionAbleDto } from '../collection-able/dto/collection-able.dto';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionRepo: CollectionRepository,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async createCollection(payload: CreateCollectionDto) {
    return this.collectionRepo.prisma.collection.create({
      data: {
        teamId: payload.teamId,
        name: payload.name,
        description: payload.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findFirst(teamId: string, collectionId: string) {
    return this.collectionRepo.prisma.collection.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
      },
      where: {
        id: collectionId.toLowerCase(),
        teamId: teamId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  async findFirstWithRecords(teamId: string, collectionId: string) {
    return this.collectionRepo.prisma.collection.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
        records: {
          select: {
            id: true,
            mediaId: true,
          },
          where: {
            deletedAt: null,
          },
        },
      },
      where: {
        id: collectionId.toLowerCase(),
        teamId: teamId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  async findAll(teamId: string) {
    return this.collectionRepo.prisma.collection.findMany({
      select: {
        id: true,
        name: true,
        records: {
          select: {
            id: true,
          },
        },
      },
      where: {
        teamId: teamId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  async findAllPaginated(teamId: string, page: number) {
    return this.collectionRepo.prisma.collection
      .paginate({
        select: {
          id: true,
          name: true,
          description: true,
          records: {
            select: {
              id: true,
            },
            where: {
              deletedAt: null,
            },
          },
        },
        where: {
          teamId: teamId.toLowerCase(),
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      .withPages({
        limit: 10,
        page: Number(page),
        includePageCount: true,
      });
  }

  async findAllFor(model: CollectionAbleDto) {
    return this.collectionRepo.prisma.collection.findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        collectionAbles: {
          some: {
            collectionAbleId: model.id,
            collectionAbleType: model.type,
          },
        },
        deletedAt: null,
      },
    });
  }

  async findAllWithRecordsFor(model: CollectionAbleDto) {
    return this.collectionRepo.prisma.collection.findMany({
      select: {
        id: true,
        name: true,
        records: {
          select: {
            id: true,
          },
          where: {
            deletedAt: null,
          },
        },
      },
      where: {
        collectionAbles: {
          some: {
            collectionAbleId: model.id,
            collectionAbleType: model.type,
          },
        },
        deletedAt: null,
      },
    });
  }

  async findMany(teamId: string) {
    return this.collectionRepo.prisma.collection.findMany({
      where: {
        teamId: teamId.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  async update(
    teamId: string,
    collectionId: string,
    payload: CreateCollectionDto,
  ) {
    return this.collectionRepo.prisma.collection.update({
      where: {
        id: collectionId.toLowerCase(),
        teamId: teamId.toLowerCase(),
      },
      data: {
        name: payload.name,
        description: payload.description,
        updatedAt: new Date(),
      },
    });
  }

  async softDelete(teamId: string, collectionId: string) {
    return await this.collectionRepo.prisma.$transaction([
      // delete all collectionables
      this.collectionRepo.prisma.collectionAble.deleteMany({
        where: {
          collectionId: collectionId.toLowerCase(),
        },
      }),

      // soft delete all records
      this.collectionRepo.prisma.record.updateMany({
        where: {
          collectionId: collectionId.toLowerCase(),
        },
        data: {
          deletedAt: new Date(),
        },
      }),

      // soft delete collection
      this.collectionRepo.prisma.collection.update({
        where: {
          id: collectionId.toLowerCase(),
          teamId: teamId.toLowerCase(),
        },
        data: {
          deletedAt: new Date(),
        },
      }),
    ]);
  }

  async delete(teamId: string, collectionId: string) {
    // find the collection
    const collection = await this.findFirstWithRecords(teamId, collectionId);

    if (!collection) {
      throw new Error('Collection not found');
    }

    // delete embeddings
    const records = collection.records
      .filter((record) => record && record.mediaId)
      .map((record) => ({
        mediaId: record.mediaId!,
        recordId: record.id,
      }));

    for (const record of records) {
      await this.embeddingService.deleteEmbeddings({
        mediaId: record.mediaId,
        recordIds: [record.recordId],
      });
    }

    return await this.collectionRepo.prisma.$transaction([
      // delete all collectionables
      this.collectionRepo.prisma.collectionAble.deleteMany({
        where: {
          collectionId: collectionId.toLowerCase(),
        },
      }),

      // delete all records
      this.collectionRepo.prisma.record.deleteMany({
        where: {
          collectionId: collectionId.toLowerCase(),
        },
      }),

      // delete collection
      this.collectionRepo.prisma.collection.delete({
        where: {
          id: collectionId.toLowerCase(),
          teamId: teamId.toLowerCase(),
        },
      }),
    ]);
  }
}
