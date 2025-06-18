import { QueueName } from '@/modules/queue/enums/queue-name.enum';
import {
  FluxKontextMaxBody,
  FluxKontextMaxInputsDto,
} from '@/modules/text-to-image/dto/flux-context-max-inputs.dto';
import {
  FluxKontextProBody,
  FluxKontextProInputsDto,
} from '@/modules/text-to-image/dto/flux-context-pro-inputs.dto';
import { GoogleImageInputsDto } from '@/modules/text-to-image/dto/google-image-inputs.dto';
import { GoogleImageGenBody } from '@/modules/text-to-image/dto/google-imagegen-body.dto';
import { PollingResult } from '@/modules/text-to-image/interfaces/polling-result.interface';
import { GoogleImageGenerator } from '@/modules/text-to-image/utils/google-image';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { StorageService } from '../storage/storage.service';
import { MediaService } from './../media/media.service';
import { FluxProBody, FluxProInputsDto } from './dto/flux-pro-inputs.dto';
import { FluxUltraBody, FluxUltraInputsDto } from './dto/flux-ultra-inputs.dto';
import { ImageConversionJobDataDto } from './dto/image-conversion-job-data.dto';
import { TextToImageRepository } from './repositories/text-to-image.repository';
import { FluxImageGenerator, StatusResponse } from './utils/flux-image';

const TextToImageRunStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  MODERATED: 'MODERATED',
  FAILED: 'FAILED',
} as const;
type TextToImageRunStatus = (typeof TextToImageRunStatus)[keyof typeof TextToImageRunStatus];

interface RunSettings {
  provider: string;
}

interface Run {
  id: string;
  settings: RunSettings;
}

interface GenImageResult {
  run: Run;
  genImage: PollingResult;
}

type RunProvider = 'fluxpro' | 'fluxultra' | 'fluxkontextpro' | 'fluxkontextmax' | 'googleimagegen';

type GenImageExtension = 'jpeg' | 'png';

type GenerateImagesPayload =
  | FluxProInputsDto
  | FluxUltraInputsDto
  | FluxKontextProInputsDto
  | FluxKontextMaxInputsDto
  | GoogleImageInputsDto;

@Injectable()
export class TextToImageService {
  private readonly logger = new Logger(TextToImageService.name);

  constructor(
    private readonly textToImageRepo: TextToImageRepository,
    private readonly fluxImageGenerator: FluxImageGenerator,
    private readonly googleImageGenerator: GoogleImageGenerator,
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService,
    @InjectQueue(QueueName.IMAGE_CONVERSION)
    private readonly imageConversionQueue: Queue,
  ) {}

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

  public async getFolderImagesRuns(folderId: string, options: { showDeleted?: boolean }) {
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

  public async getImageById(imageId: string) {
    const image = await this.textToImageRepo.prisma.textToImage.findUnique({
      select: {
        id: true,
        name: true,
        path: true,
        status: true,
      },
      where: {
        id: imageId,
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return image;
  }

  public async downloadImage(imageId: string) {
    const image = await this.textToImageRepo.prisma.textToImage.findUnique({
      select: {
        id: true,
        path: true,
      },
      where: {
        id: imageId,
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    // image path example: https://images.ragna.io/re293wl5kyslbum92agwwcid/tti/l1aymowaaoggvezcte34l2ws/image-e3349e0f-9ddb-40fa-8bd0-0eeed0813d69.jpeg
    // bucket path without https://images.ragna.io/
    const bucketPath = image.path.split('https://images.ragna.io/')[1];

    return this.storageService.downloadFromBucket({
      bucket: 'images',
      bucketPath,
    });
  }

  async getFolderImagesRunsPaginated(
    folderId: string,
    options: { page: number; showDeleted?: boolean },
  ) {
    const [runs, meta] = await this.textToImageRepo.prisma.textToImageRun
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
              conversions: {
                select: {
                  id: true,
                  name: true,
                  path: true,
                  mimeType: true,
                  status: true,
                },
              },
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

    /* example response
        "runs": [
            {
            "id": "ftpnn3jn0auvg7d70w4jkm7v",
            "status": "PENDING",
            "prompt": "a modern car on the road",
            "settings": {
                "provider": "fluxpro"
            },
            "deletedAt": null,
            "images": [
                {
                    "id": "it02f29xq1t93raii10t5ms3",
                    "name": "image-6d1ad3aa-21ec-46d8-98b6-42a686a486c2.jpeg",
                    "path": "https://images.ragna.io/sy64yc49l5s13z92jkjqf3mt/tti/lnbfa1cphi2ivjbumpxq4qka/image-6d1ad3aa-21ec-46d8-98b6-42a686a486c2.jpeg",
                    "status": "COMPLETED",
                    "thumb": {
                    "webp": "https://images.ragna.io/sy64yc49l5s13z92jkjqf3mt/tti/lnbfa1cphi2ivjbumpxq4qka/image-6d1ad3aa-21ec-46d8-98b6-42a686a486c2.webp",
                    "avif": "https://images.ragna.io/sy64yc49l5s13z92jkjqf3mt/tti/lnbfa1cphi2ivjbumpxq4qka/image-6d1ad3aa-21ec-46d8-98b6-42a686a486c2.avif"
                    }
                }
            ],
        },
    ]
    */

    const mergedRuns = runs.map((run) => {
      return {
        ...run,
        images: run.images.map((image) => ({
          id: image.id,
          name: image.name,
          path: image.path,
          status: image.status,
          thumb: {
            webp:
              image.conversions.find((conversion) => conversion.mimeType === 'image/webp')?.path ??
              null,
            avif:
              image.conversions.find((conversion) => conversion.mimeType === 'image/avif')?.path ??
              null,
          },
        })),
      };
    });

    return {
      runs: mergedRuns,
      meta,
    };
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

  public async getFolderImagesSliced(folderId: string, skip: number, take: number) {
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

  //
  // Generates images for a specific run and processes the results
  //

  public async generateFluxProImages({
    userId,
    payload,
  }: {
    userId: string;
    payload: FluxProBody;
  }): Promise<string[]> {
    const imgCount = payload.imgCount ?? 1;

    const genImageDto = FluxProInputsDto.fromInput({
      prompt: payload.prompt,
      output_format: payload.outputFormat,
      width: payload.width,
      height: payload.height,
      prompt_upsampling: payload.promptUpsampling,
      seed: payload.seed,
      safety_tolerance: payload.safetyTolerance,
    });

    try {
      const run = await this.createSingleRun('fluxpro', payload);
      const genImageResults = await this.generateImagesForRun(run, imgCount, genImageDto);
      return this.processImageResults(userId, genImageResults, payload);
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new Error('Failed to generate images');
    }
  }

  public async generateFluxUltraImages({
    userId,
    payload,
  }: {
    userId: string;
    payload: FluxUltraBody;
  }): Promise<string[]> {
    const imgCount = payload.imgCount ?? 1;

    const genImageDto = FluxUltraInputsDto.fromInput({
      prompt: payload.prompt,
      seed: payload.seed,
      aspect_ratio: payload.aspectRatio,
      safety_tolerance: payload.safetyTolerance,
      output_format: payload.outputFormat,
      raw: payload.raw,
      image_prompt: payload.imagePrompt,
      image_prompt_strength: payload.imagePromptStrength,
    });

    try {
      const run = await this.createSingleRun('fluxultra', payload);
      const genImageResults = await this.generateImagesForRun(run, imgCount, genImageDto);
      return this.processImageResults(userId, genImageResults, payload);
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new Error('Failed to generate images');
    }
  }

  public async generateFluxKontextProImages({
    userId,
    payload,
  }: {
    userId: string;
    payload: FluxKontextProBody;
  }) {
    const imgCount = payload.imgCount ?? 1;
    let imageBuffer: Buffer | null = null;

    if (payload.referenceImageId && !payload.referenceImageIsUpload) {
      // image is generated
      imageBuffer = await this.downloadImage(payload.referenceImageId);
    } else if (payload.referenceImageId && payload.referenceImageIsUpload) {
      // image is uploaded
      const media = await this.mediaService.findFirst(payload.referenceImageId);
      if (!media) {
        throw new NotFoundException('Media not found');
      }
      imageBuffer = await this.storageService.downloadFromBucket({
        bucket: 'images',
        bucketPath: media.filePath,
      });
    }

    const genImageDto = FluxKontextProInputsDto.fromInput({
      prompt: payload.prompt,
      input_image: imageBuffer ? this.bufferToBase64(imageBuffer) : undefined,
      seed: payload.seed,
      aspect_ratio: payload.aspectRatio,
      output_format: payload.outputFormat,
      prompt_upsampling: payload.promptUpsampling,
      safety_tolerance: payload.safetyTolerance,
    });

    try {
      const run = await this.createSingleRun('fluxkontextpro', payload);
      const genImageResults = await this.generateImagesForRun(run, imgCount, genImageDto);
      return this.processImageResults(userId, genImageResults, payload);
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new Error('Failed to generate images');
    }
  }

  public async generateFluxKontextMaxImages({
    userId,
    payload,
  }: {
    userId: string;
    payload: FluxKontextMaxBody;
  }): Promise<string[]> {
    const imgCount = payload.imgCount ?? 1;

    const genImageDto = FluxKontextMaxInputsDto.fromInput({
      prompt: payload.prompt,
      input_image: undefined,
      seed: payload.seed,
      aspect_ratio: payload.aspectRatio,
      output_format: payload.outputFormat,
      prompt_upsampling: payload.promptUpsampling,
      safety_tolerance: payload.safetyTolerance,
    });

    try {
      const run = await this.createSingleRun('fluxkontextmax', payload);
      const genImageResults = await this.generateImagesForRun(run, imgCount, genImageDto);
      return this.processImageResults(userId, genImageResults, payload);
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new Error('Failed to generate images');
    }
  }

  public async generateGoogleImagegenImages({
    userId,
    payload,
  }: {
    userId: string;
    payload: GoogleImageGenBody;
  }): Promise<string[]> {
    const imgCount = payload.imgCount ?? 1;

    const genImageDto = GoogleImageInputsDto.fromInput({
      prompt: payload.prompt,
      aspectRatio: payload.aspectRatio,
    });

    try {
      const run = await this.createSingleRun('googleimagegen', payload);
      const genImageResults = await this.generateImagesForRun(run, imgCount, genImageDto);
      return this.processImageResults(userId, genImageResults, payload);
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new Error('Failed to generate images');
    }
  }

  private async createSingleRun(
    provider: RunProvider,
    payload:
      | FluxProBody
      | FluxUltraBody
      | FluxKontextProBody
      | FluxKontextMaxBody
      | GoogleImageGenBody,
  ): Promise<Run> {
    if (!provider) {
      throw new Error('Invalid request');
    }

    try {
      return await this.createRun({
        folderId: payload.folderId,
        prompt: payload.prompt,
        settings: {
          provider,
        },
      });
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
      throw new Error('Failed to create run');
    }
  }

  private async createRun(payload: {
    folderId: string;
    prompt: string;
    settings: RunSettings;
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
      settings: run.settings as RunSettings,
    };
  }

  private async generateImagesForRun(
    run: Run,
    imageCount: number,
    payload: GenerateImagesPayload,
  ): Promise<GenImageResult[]> {
    return Promise.all(
      Array.from({ length: imageCount }, () => this.generateSingleImage(run, payload)),
    );
  }

  private async generateSingleImage(
    run: Run,
    payload: GenerateImagesPayload,
  ): Promise<GenImageResult> {
    let pollResult: PollingResult | null = null;

    try {
      switch (run.settings.provider) {
        case 'googleimagegen':
          pollResult = await this.googleImageGenerator.generateImage(payload);
          break;
        case 'fluxpro':
        case 'fluxultra':
        case 'fluxkontextpro':
        case 'fluxkontextmax':
          pollResult = await this.fluxImageGenerator.generateImage(payload as any);
          break;
        default:
          throw new Error(`Unsupported provider: ${run.settings.provider}`);
      }

      if (!pollResult || !pollResult.id) {
        throw new Error('Invalid polling result');
      }

      return {
        run,
        genImage: pollResult,
      };
    } catch (error: any) {
      this.logger.error(`Error: ${error?.message}`);
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
    payload: FluxProBody,
  ): Promise<string[]> {
    this.logger.debug(`Processing ${results.length} image results for user ${userId}`, payload);
    // return;
    return Promise.all(
      results.map((result) =>
        this.processSingleImageResult({
          userId,
          folderId: payload.folderId,
          result,
          fileExtension: payload.outputFormat,
        }),
      ),
    );
  }

  private async processSingleImageResult(payload: {
    userId: string;
    folderId: string; // users can have multiple folders to separate images
    result: GenImageResult;
    fileExtension: GenImageExtension;
  }): Promise<string> {
    const { genImage, run } = payload.result;
    const { id: runId } = run;

    const fileName = `image-${genImage.id}.${payload.fileExtension}`;
    const bucketFolderPath = `${payload.userId}/tti/${payload.folderId}`;
    const mimeType = this.storageService.getMimeType(payload.fileExtension);

    let fileUrl: string | null = null;

    try {
      if (genImage.imgBuffer && !genImage.imgUrl && genImage.imgBuffer.length > 0) {
        // if image buffer
        const { filePath } = await this.storageService.uploadBufferToBucket('images', {
          bucketPath: bucketFolderPath,
          fileName,
          fileBuffer: genImage.imgBuffer,
          fileExtension: payload.fileExtension,
        });
        fileUrl = filePath;
      } else if (genImage.imgUrl && !genImage.imgBuffer && genImage.imgUrl.length > 0) {
        // if image URL
        const { storagefileUrl } = await this.storageService.uploadToBucketByUrl({
          fileName,
          fileMimeType: mimeType,
          fileUrl: genImage.imgUrl,
          bucketFolder: bucketFolderPath,
          bucket: 'images',
        });
        fileUrl = storagefileUrl;
      } else {
        this.logger.error(`Image URL or Buffer is missing for run ${run.id}`);
        throw new Error('Image URL or Buffer is missing');
      }

      const textToImage = await this.createTextToImage({
        runId,
        fileName,
        filePath: fileUrl,
        mimeType,
        status: this.castStatus(genImage.status),
      });

      //TODO: kick off image moderation

      // kick off image conversion
      await this.imageConversionQueue.add(
        'create-preview-images',
        ImageConversionJobDataDto.fromInput({
          runId,
          imageId: textToImage.id,
          filePathOrUrl: genImage.imgUrl,
          bucketPath: bucketFolderPath,
          fileName,
        }),
      );

      return textToImage.path;
    } catch (error: any) {
      this.logger.error(`Failed to process image for run ${run.id}: ${error?.message}`);
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

  private async updateRunStatus(payload: { runId: string; status: TextToImageRunStatus }) {
    return this.textToImageRepo.prisma.textToImageRun.update({
      where: {
        id: payload.runId,
      },
      data: {
        status: payload.status,
      },
    });
  }

  // HELPERS

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

  private bufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  }

  private base64ToBuffer(base64: string): Buffer {
    return Buffer.from(base64, 'base64');
  }
}
