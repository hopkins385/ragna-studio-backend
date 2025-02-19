import { StorageService } from '@/modules/storage/storage.service';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ImageConversionJobDataDto } from '../dto/image-conversion-job-data.dto';
import { Inject, Logger } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { AxiosInstance } from 'axios';
import { HTTP_CLIENT } from '@/modules/http-client/constants';
import { join } from 'node:path';
import { Worker } from 'worker_threads';

@Processor('image-conversion')
export class ImageConversionProcessor extends WorkerHost {
  private readonly logger = new Logger(ImageConversionProcessor.name);
  private imageWorker: Worker;

  constructor(
    private readonly storageService: StorageService,
    @Inject(HTTP_CLIENT)
    private readonly httpClient: AxiosInstance,
  ) {
    super();
    this.imageWorker = new Worker(
      join(__dirname, '../workers/image-conversion.worker.js'),
    );
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { data, name } = job;
    const {
      filePathOrUrl,
      bucketPath: oldBucketPath,
      fileName,
    } = data as ImageConversionJobDataDto;

    // if the file is a URL, download it
    let fileBuffer: Buffer;
    if (filePathOrUrl.startsWith('https://')) {
      fileBuffer = await this.downloadFileFromUrl(filePathOrUrl);
    } else {
      fileBuffer = await readFile(filePathOrUrl);
    }

    this.logger.debug(
      `Processing image', oldBucketPath: ${oldBucketPath}, fileName: ${fileName}`,
    );

    // resize and convert to avif and webp
    // const avifBuffer = await sharp(fileBuffer).resize(300).avif().toBuffer();
    // const webpBuffer = await sharp(fileBuffer).resize(300).webp().toBuffer();

    this.imageWorker.postMessage(fileBuffer);

    const result = await new Promise<{
      avifBuffer: Buffer;
      webpBuffer: Buffer;
      error: any;
    }>((resolve, reject) => {
      this.imageWorker.on(
        'message',
        (message: { avifBuffer: Buffer; webpBuffer: Buffer; error: any }) => {
          if (message.error) {
            reject(message.error);
          } else {
            resolve(message);
          }
        },
      );
      this.imageWorker.on('error', reject);
      this.imageWorker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });

    if (result.error) {
      throw result.error;
    }

    const { avifBuffer, webpBuffer } = result;

    const newBucketPath = `${oldBucketPath}/converted`;
    // remove file extension (e.g. abc-file.jpg -> abc-file)
    const splt = fileName.split('.');
    const newfileName = splt?.[0] ?? fileName;

    const uploadAvif = this.storageService.uploadBufferToBucket('images', {
      bucketPath: newBucketPath,
      fileBuffer: avifBuffer,
      fileName: `${newfileName}.avif`,
      fileExtension: 'avif',
    });

    const uploadWebp = this.storageService.uploadBufferToBucket('images', {
      bucketPath: newBucketPath,
      fileBuffer: webpBuffer,
      fileName: `${newfileName}.webp`,
      fileExtension: 'webp',
    });

    await Promise.all([uploadAvif, uploadWebp]);
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
    return this.logger.debug(
      `Job ${job.name} completed for ${job.data?.fileName}`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    return this.logger.error(
      `Job ${job.name} failed for ${job.data?.fileName}`,
    );
  }

  private async downloadFileFromUrl(url: string): Promise<Buffer> {
    const response = await this.httpClient.get(url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  }
}
