import { HTTP_CLIENT } from '@/modules/http-client/constants';
import { StorageService } from '@/modules/storage/storage.service';
import { ImageConversionJobDataDto } from '@/modules/text-to-image/dto/image-conversion-job-data.dto';
import { TextToImageRepository } from '@/modules/text-to-image/repositories/text-to-image.repository';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { Job } from 'bullmq';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

@Processor('image-conversion')
export class ImageConversionProcessor extends WorkerHost {
  private readonly logger = new Logger(ImageConversionProcessor.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly textToImageRepo: TextToImageRepository,
    @Inject(HTTP_CLIENT)
    private readonly httpClient: AxiosInstance,
  ) {
    super();
  }

  async process(job: Job<ImageConversionJobDataDto>): Promise<void> {
    const { imageId, filePathOrUrl, bucketPath: oldBucketPath, fileName } = job.data;

    if (!imageId || !filePathOrUrl || !filePathOrUrl.length || typeof filePathOrUrl !== 'string') {
      throw new Error('Invalid job data');
    }

    // if the file is a URL, download it
    let fileBuffer: Buffer;
    if (filePathOrUrl.startsWith('https://')) {
      fileBuffer = await this.downloadFileFromUrl(filePathOrUrl);
    } else {
      fileBuffer = await readFile(filePathOrUrl);
    }

    const { avifBuffer, webpBuffer } = await this.processImage(fileBuffer);

    const newBucketPath = `${oldBucketPath}/thumb`;
    // remove file extension (e.g. abc-file.jpg -> abc-file)
    const splt = fileName.split('.');
    const newfileName = splt?.[0] ?? fileName;

    const uploadWebp = await this.storageService.uploadBufferToBucket('images', {
      bucketPath: newBucketPath,
      fileBuffer: webpBuffer,
      fileName: `${newfileName}.webp`,
      fileExtension: 'webp',
    });

    const updateDbResult = await this.createImageConversionEntry({
      imageId,
      fileName: `${newfileName}.webp`,
      filePath: `https://images.ragna.io/${newBucketPath}/${newfileName}.webp`,
      mimeType: 'image/webp',
    });

    /*
    const uploadAvif = this.storageService.uploadBufferToBucket('images', {
      bucketPath: newBucketPath,
      fileBuffer: avifBuffer,
      fileName: `${newfileName}.avif`,
      fileExtension: 'avif',
    });

    await Promise.all([uploadAvif, uploadWebp]);
    */
  }

  @OnWorkerEvent('ready')
  onReady() {
    this.logger.log('Worker ready');
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`Job ${job.name} started for ${job.data?.fileName}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    return this.logger.debug(`Job ${job.name} completed for ${job.data?.fileName}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    return this.logger.error(
      `Job ${job.name} failed for ${job.data?.fileName} because of ${job.failedReason} `,
    );
  }

  private async downloadFileFromUrl(url: string): Promise<Buffer> {
    const response = await this.httpClient.get(url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  }

  private async processImage(fileBuffer: Buffer) {
    try {
      const avifBufferPromise = sharp(fileBuffer).resize(300).avif().toBuffer();
      const webpBufferPromise = sharp(fileBuffer).resize(300).webp().toBuffer();

      const [avifBuffer, webpBuffer] = await Promise.all([avifBufferPromise, webpBufferPromise]);

      return { avifBuffer, webpBuffer };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing image: ${errMsg}`);
      throw new Error('Image processing failed');
    }
  }

  private async createImageConversionEntry(payload: {
    imageId: string;
    fileName: string;
    filePath: string;
    mimeType: string;
  }) {
    try {
      return await this.textToImageRepo.prisma.textToImageConversion.create({
        data: {
          imageId: payload.imageId,
          name: payload.fileName,
          path: payload.filePath,
          mimeType: payload.mimeType,
          status: 'COMPLETED',
        },
      });
    } catch (error) {
      // this.logger.error(`Failed to create image conversion entry: ${error}`);
      // update the status to failed
      throw error;
    }
  }
}
