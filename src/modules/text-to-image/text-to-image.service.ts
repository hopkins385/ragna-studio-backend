import { Injectable } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { FluxProInputs } from './schemas/flux-pro.schema';
import { FluxImageGenerator, StatusResponse } from './utils/flux-image';
import { StorageService } from '../storage/storage.service';
import { TextToImageRepository } from './repositories/text-to-image.repository';

enum TextToImageRunStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  MODERATED = 'MODERATED',
  FAILED = 'FAILED',
}

interface Run {
  id: string;
}

interface GenImageResult {
  run: Run;
  genImage: {
    id: string;
    imgUrl: string | null;
    status: StatusResponse;
  };
}

@Injectable()
export class TextToImageService {
  constructor(
    private readonly textToImageRepo: TextToImageRepository,
    private readonly fluxImageGenerator: FluxImageGenerator,
    private readonly storageService: StorageService,
  ) {}
  public async generateFluxProImages(
    user: UserEntity,
    payload: FluxProInputs,
  ): Promise<string[]> {
    const imgCount = payload.imgCount ?? 1;

    try {
      const run = await this.createSingleRun(payload);
      const genImageResults = await this.generateImagesForRun(
        run,
        imgCount,
        payload,
      );
      return this.processImageResults(user.id, genImageResults, payload);
    } catch (error) {
      // logger.error('Failed to generate images:', error);
      throw new Error('Failed to generate images');
    }
  }

  public async createFolder(payload: { teamId: string; folderName: string }) {
    return this.textToImageRepo.prisma.textToImageFolder.create({
      data: {
        teamId: payload.teamId,
        name: payload.folderName,
      },
    });
  }

  public async findFolders(payload: { teamId: string }) {
    return this.textToImageRepo.prisma.textToImageFolder.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        teamId: payload.teamId,
        deletedAt: null,
      },
    });
  }

  public async findFolderById(id: string) {
    return this.textToImageRepo.prisma.textToImageFolder.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  public async getFolderImages(folderId: string) {
    return this.textToImageRepo.prisma.textToImage.findMany({
      select: {
        id: true,
        name: true,
        path: true,
        run: {
          select: {
            status: true,
          },
        },
      },
      where: {
        run: {
          folderId,
        },
        deletedAt: null,
      },
    });
  }

  public async getFolderImagesRuns(
    folderId: string,
    options: { showDeleted?: boolean },
  ) {
    // get all images of a folder but group them by run
    return this.textToImageRepo.prisma.textToImageRun.findMany({
      select: {
        id: true,
        status: true,
        prompt: true,
        settings: true,
        deletedAt: true,
        images: {
          select: {
            id: true,
            name: true,
            path: true,
            status: true,
          },
          where: {
            deletedAt: null,
          },
        },
      },
      where: {
        folderId,
        deletedAt: options.showDeleted ? undefined : null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getFolderImagesRunsPaginated(
    folderId: string,
    options: { page: number; showDeleted?: boolean },
  ) {
    return this.textToImageRepo.prisma.textToImageRun
      .paginate({
        select: {
          id: true,
          status: true,
          prompt: true,
          settings: true,
          deletedAt: true,
          images: {
            select: {
              id: true,
              name: true,
              path: true,
              status: true,
            },
            where: {
              deletedAt: null,
            },
          },
        },
        where: {
          folderId,
          deletedAt: options.showDeleted ? undefined : null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      .withPages({
        limit: 10,
        page: options.page,
        includePageCount: true,
      });
  }

  async getRandomImagesPaginated(options: { page: number }) {
    const { page } = options;
    return this.textToImageRepo.prisma.textToImageRun
      .paginate({
        select: {
          id: true,
          prompt: true,
          images: {
            select: {
              id: true,
              name: true,
              path: true,
              status: true,
            },
            where: {
              deletedAt: null,
            },
            take: 1,
          },
        },
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      .withPages({
        limit: 30,
        page,
        includePageCount: true,
      });
  }

  public async getFolderImagesSliced(
    folderId: string,
    skip: number,
    take: number,
  ) {
    const images = await this.textToImageRepo.prisma.textToImage.findMany({
      select: {
        id: true,
        name: true,
        path: true,
      },
      where: {
        run: {
          folderId,
        },
        deletedAt: null,
      },
      skip,
      take,
    });
    return images.map((image) => {
      return {
        id: image.id,
        name: image.name,
        path: image.path,
      };
    });
  }

  public async softDeleteRun(runId: string) {
    return this.textToImageRepo.prisma.textToImageRun.update({
      where: {
        id: runId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async unDeleteRun(runId: string) {
    return this.textToImageRepo.prisma.textToImageRun.update({
      where: {
        id: runId,
      },
      data: {
        deletedAt: null,
      },
    });
  }

  public async toggleSoftDeleteRun(runId: string) {
    const run = await this.textToImageRepo.prisma.textToImageRun.findUnique({
      where: {
        id: runId,
      },
    });

    if (!run) {
      throw new Error('Run not found');
    }

    if (run.deletedAt) {
      return this.unDeleteRun(runId);
    }

    return this.softDeleteRun(runId);
  }

  private async createSingleRun(payload: FluxProInputs): Promise<Run> {
    try {
      return await this.createRun({
        folderId: payload.folderId,
        prompt: payload.prompt,
        settings: {},
      });
    } catch (error) {
      // logger.error('Failed to create run:', error);
      throw new Error('Failed to create run');
    }
  }

  private async createRun(payload: {
    folderId: string;
    prompt: string;
    settings: any;
  }): Promise<Run> {
    const run = await this.textToImageRepo.prisma.textToImageRun.create({
      data: {
        folderId: payload.folderId,
        prompt: payload.prompt,
        settings: payload.settings,
        status: TextToImageRunStatus.PENDING,
      },
    });

    return {
      id: run.id,
    };
  }

  private async generateImagesForRun(
    run: Run,
    imageCount: number,
    payload: FluxProInputs,
  ): Promise<GenImageResult[]> {
    return Promise.all(
      Array.from({ length: imageCount }, () =>
        this.generateSingleImage(run, payload),
      ),
    );
  }

  private async generateSingleImage(
    run: Run,
    payload: FluxProInputs,
  ): Promise<GenImageResult> {
    try {
      //@ts-ignore
      const genImage = await this.fluxImageGenerator.generateImage(payload);
      return {
        run,
        genImage,
      };
    } catch (error) {
      // logger.error(`Failed to generate image:`, error);
      await this.updateRunStatus({
        runId: run.id,
        status: TextToImageRunStatus.FAILED,
      });
      return {
        run,
        genImage: {
          id: '',
          imgUrl: null,
          status: StatusResponse.Error,
        },
      };
    }
  }

  private async processImageResults(
    userId: string,
    results: GenImageResult[],
    payload: FluxProInputs,
  ): Promise<string[]> {
    return Promise.all(
      results.map((result) =>
        this.processSingleImageResult({
          userId,
          folderId: payload.folderId,
          result,
        }),
      ),
    );
  }

  private async processSingleImageResult(payload: {
    userId: string;
    folderId: string;
    result: GenImageResult;
  }): Promise<string> {
    const { genImage, run } = payload.result;

    const fileName = `image-${genImage.id}.jpg`;
    const folder = `${payload.userId}/text-to-image/${payload.folderId}`;
    const mimeType = 'image/jpg';

    let newfileUrl: string = '';

    try {
      if (genImage.imgUrl) {
        const { storagefileUrl } =
          await this.storageService.uploadToBucketByUrl({
            fileName,
            fileMimeType: mimeType,
            fileUrl: genImage.imgUrl,
            bucketFolder: folder,
            bucket: 'images',
          });
        newfileUrl = storagefileUrl;
      }

      const textToImage = await this.createTextToImage({
        runId: run.id,
        fileName,
        filePath: newfileUrl,
        mimeType,
        status: this.castStatus(genImage.status),
      });

      return textToImage.path;
    } catch (error) {
      // logger.error(`Failed to process image for run ${run.id}:`, error);
      return '';
    }
  }

  private async createTextToImage(payload: {
    runId: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    status: TextToImageRunStatus;
  }) {
    return this.textToImageRepo.prisma.textToImage.create({
      data: {
        runId: payload.runId,
        name: payload.fileName,
        path: payload.filePath,
        mimeType: payload.mimeType,
        status: payload.status,
      },
    });
  }

  private async updateRunStatus(payload: {
    runId: string;
    status: TextToImageRunStatus;
  }) {
    return this.textToImageRepo.prisma.textToImageRun.update({
      where: {
        id: payload.runId,
      },
      data: {
        status: payload.status,
      },
    });
  }

  private castStatus(status: StatusResponse): TextToImageRunStatus {
    switch (status) {
      case StatusResponse.Pending:
        return TextToImageRunStatus.PENDING;
      case StatusResponse.Ready:
        return TextToImageRunStatus.COMPLETED;
      case StatusResponse.Error:
        return TextToImageRunStatus.FAILED;
      case StatusResponse.RequestModerated:
      case StatusResponse.ContentModerated:
        return TextToImageRunStatus.MODERATED;
      default:
        return TextToImageRunStatus.FAILED;
    }
  }
}
