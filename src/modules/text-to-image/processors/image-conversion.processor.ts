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

interface WorkerResult {
  avifBuffer: Buffer;
  webpBuffer: Buffer;
  error: unknown;
}

const imageConversionWorkerPath = join(
  __dirname,
  '../workers/image-conversion.worker.js',
);

@Processor('image-conversion')
export class ImageConversionProcessor extends WorkerHost {
  private readonly logger = new Logger(ImageConversionProcessor.name);
  private imageWorker: Worker;
  private isWorkerRestarting: boolean = false;
  private restartAttempts: number = 0;
  private readonly maxRestartAttempts: number = 5;
  private readonly imageConversionTimeout: number = 30000; // 30 seconds

  constructor(
    private readonly storageService: StorageService,
    @Inject(HTTP_CLIENT)
    private readonly httpClient: AxiosInstance,
  ) {
    super();
    // this.imageWorker = this.createWorker();
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

    this.imageWorker.postMessage(fileBuffer);

    const result: WorkerResult = await Promise.race([
      new Promise<WorkerResult>((resolve, reject) => {
        const messageListener = (message: WorkerResult) => {
          if (message.error) {
            reject(message.error);
          } else {
            resolve(message);
          }
          this.imageWorker.removeListener('message', messageListener);
          this.imageWorker.removeListener('error', errorListener);
          this.imageWorker.removeListener('exit', exitListener);
        };

        const errorListener = (err: any) => {
          reject(err);
          this.imageWorker.removeListener('message', messageListener);
          this.imageWorker.removeListener('error', errorListener);
          this.imageWorker.removeListener('exit', exitListener);
        };

        const exitListener = (code: number) => {
          reject(new Error(`Worker stopped with exit code ${code}`));
          this.imageWorker.removeListener('message', messageListener);
          this.imageWorker.removeListener('error', errorListener);
          this.imageWorker.removeListener('exit', exitListener);
        };

        this.imageWorker.on('message', messageListener);
        this.imageWorker.on('error', errorListener);
        this.imageWorker.on('exit', exitListener);
      }),
      new Promise<WorkerResult>((_, reject) =>
        setTimeout(() => {
          reject(new Error('Image conversion timed out'));
        }, this.imageConversionTimeout),
      ),
    ]);

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

  private createWorker(): Worker {
    const worker = new Worker(imageConversionWorkerPath);

    const exitListener = (code: number) => {
      if (code !== 0 && !this.isWorkerRestarting) {
        this.logger.error(`Worker stopped with exit code ${code}`);
        this.restartWorker();
      }
      worker.removeListener('exit', exitListener);
      worker.removeListener('error', errorListener);
    };

    const errorListener = (err: Error) => {
      this.logger.error(`Worker error: ${err.message}`);
      if (!this.isWorkerRestarting) {
        this.restartWorker();
      }
      worker.removeListener('exit', exitListener);
      worker.removeListener('error', errorListener);
    };

    worker.on('exit', exitListener);
    worker.on('error', errorListener);

    return worker;
  }

  private restartWorker(): void {
    if (this.isWorkerRestarting) {
      return;
    }

    if (this.restartAttempts >= this.maxRestartAttempts) {
      this.logger.error(
        `Max restart attempts reached (${this.maxRestartAttempts}). Giving up on worker restarts.`,
      );
      return;
    }

    this.restartAttempts++;
    this.logger.log(
      `Restarting worker (attempt ${this.restartAttempts}/${this.maxRestartAttempts})...`,
    );
    this.isWorkerRestarting = true;

    const backoffDelay = Math.min(this.restartAttempts * 1000, 10000); // Exponential backoff, max 10 seconds

    setTimeout(() => {
      this.imageWorker = this.createWorker();
      this.isWorkerRestarting = false;
      this.logger.log('Worker restarted.');
    }, backoffDelay);
  }
}
