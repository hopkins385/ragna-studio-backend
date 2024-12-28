import type { Media } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CreateRecordDto, FindRecordsDto } from './dto/create-record.dto';
import { RecordRepository } from './repositories/record.repository';
import { MediaService } from '@/modules/media/media.service';
import { EmbeddingService } from '@/modules/embedding/embedding.service';

/**
 * Service responsible for handling record related operations
 * A record is a reference to a media file that is embedded to the vector store
 * Collection -> Record(s) -> Chunks
 * @class
 */
@Injectable()
export class RecordService {
  constructor(
    private readonly recordRepo: RecordRepository,
    private readonly mediaService: MediaService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async create(payload: CreateRecordDto) {
    // find media
    const media = await this.mediaService.findFirst(payload.mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    // find record

    const record = await this.recordRepo.prisma.record.findFirst({
      select: {
        id: true,
        collectionId: true,
        chunks: {
          select: {
            id: true,
          },
        },
      },
      where: {
        mediaId: media.id,
      },
    });

    // TODO: create new record and duplicate chunks but don't embed file again to vector store
    // for now, just create new record and embed file to vectorStore
    // return this.#embedMedia(media, payload);

    if (!record) {
      // create record and embed file to vectorStore
      // return this.#embedMedia(media, payload);
    }

    if (record?.collectionId === payload.collectionId) {
      throw new Error('Record already exists in this collection');
    }

    //throw new Error('Record already exists in another collection');

    return this.#embedMedia(media, payload);
  }

  async delete(payload: { teamId: string; recordId: string }) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // find record
    const record = await this.recordRepo.prisma.record.findFirst({
      select: {
        id: true,
        mediaId: true,
        chunks: {
          select: {
            id: true,
          },
        },
      },
      where: {
        id: payload.recordId,
        deletedAt: null,
      },
    });

    if (!record || !record.mediaId) {
      throw new Error('Record not found');
    }

    // delete Embeddings
    await this.embeddingService.deleteEmbeddings({
      mediaId: record.mediaId,
      recordIds: [record.id],
    });

    // delete record and chunks
    return this.recordRepo.prisma.record.delete({
      where: {
        id: record.id,
      },
    });
  }

  async deleteEmbeddings(payload: { mediaId: string; recordIds: string[] }) {
    return this.embeddingService.deleteEmbeddings(payload);
  }

  async #embedMedia(media: Media, payload: CreateRecordDto) {
    const { filePath, fileMime } = media;
    const cleanedFilePath = filePath.replace(process.cwd(), '');
    // create record
    const newRecord = await this.recordRepo.prisma.record.create({
      data: {
        collectionId: payload.collectionId,
        mediaId: media.id,
      },
    });

    try {
      // store/embed file to vectorStore
      const embedDocuments = await this.embeddingService.embedFile({
        mediaId: media.id,
        recordId: newRecord.id,
        mimeType: fileMime,
        filePath: cleanedFilePath,
      });

      const chunksData = embedDocuments.map((doc) => ({
        recordId: newRecord.id,
        content: doc.text,
      }));

      // create for each embedding a chunk
      const chunks = await this.recordRepo.prisma.chunk.createMany({
        data: chunksData,
      });

      // console.log('embedDocuments:', embedDocuments);

      return newRecord;
    } catch (e) {
      // delete record if embedding fails
      await this.recordRepo.prisma.record.delete({
        where: {
          id: newRecord.id,
        },
      });
      throw e;
    }
  }

  async findAll(payload: FindRecordsDto) {
    return this.recordRepo.prisma.record.findMany({
      select: {
        id: true,
        createdAt: true,
        media: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        collection: {
          id: payload.collectionId,
          teamId: payload.teamId,
        },
        deletedAt: null,
      },
    });
  }

  async findAllPaginated(
    payload: FindRecordsDto,
    page: number = 1,
    limit = 10,
  ) {
    return this.recordRepo.prisma.record
      .paginate({
        select: {
          id: true,
          createdAt: true,
          media: {
            select: {
              id: true,
              name: true,
            },
          },
          chunks: {
            select: {
              id: true,
            },
          },
        },
        where: {
          collection: {
            id: payload.collectionId,
            teamId: payload.teamId,
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
}
