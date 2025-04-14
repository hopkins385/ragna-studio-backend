import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ChildProcess, spawn } from 'child_process';
import { join } from 'path';

interface WorkerPoolItem {
  worker: ChildProcess;
  busy: boolean;
  id: number;
}

interface ProcessImageOptions {
  timeout?: number;
}

@Injectable()
export class ImageProcessingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ImageProcessingService.name);
  private readonly workerPath = join(process.cwd(), 'bin', 'image-worker');
  private readonly workerPool: WorkerPoolItem[] = [];
  private readonly poolSize: number = Math.max(2, Math.min(4, require('os').cpus().length - 1));
  private nextWorkerId: number = 0;

  constructor() {
    this.logger.debug(`Using worker path: ${this.workerPath}`);
    this.logger.debug(`Worker pool size: ${this.poolSize}`);
  }

  async onModuleInit(): Promise<void> {
    await this.initializeWorkerPool();
  }

  async onModuleDestroy(): Promise<void> {
    await this.destroyWorkerPool();
  }

  private async initializeWorkerPool(): Promise<void> {
    for (let i = 0; i < this.poolSize; i++) {
      this.addWorkerToPool();
    }
    this.logger.log(`Initialized worker pool with ${this.poolSize} workers`);
  }

  private addWorkerToPool(): WorkerPoolItem {
    const workerId = this.nextWorkerId++;
    const worker = spawn(this.workerPath);

    worker.on('error', (error) => {
      this.logger.error(`Worker ${workerId} error: ${error.message}`);
      // Replace the worker if it errors out
      this.replaceWorker(workerId);
    });

    const poolItem: WorkerPoolItem = { worker, busy: false, id: workerId };
    this.workerPool.push(poolItem);
    return poolItem;
  }

  private replaceWorker(workerId: number): void {
    const index = this.workerPool.findIndex((item) => item.id === workerId);
    if (index !== -1) {
      try {
        this.workerPool[index].worker.kill();
      } catch (error) {
        this.logger.error(`Error killing worker ${workerId}`, error);
      }
      this.workerPool.splice(index, 1);
      this.addWorkerToPool();
      this.logger.log(`Replaced worker ${workerId}`);
    }
  }

  private async destroyWorkerPool(): Promise<void> {
    for (const item of this.workerPool) {
      try {
        item.worker.kill();
      } catch (error) {
        this.logger.error(`Error killing worker ${item.id}`, error);
      }
    }
    this.workerPool.length = 0;
    this.logger.log('Worker pool destroyed');
  }

  private getAvailableWorker(): WorkerPoolItem | null {
    const availableWorker = this.workerPool.find((item) => !item.busy);
    if (availableWorker) {
      availableWorker.busy = true;
      return availableWorker;
    }
    return null;
  }

  private releaseWorker(workerId: number): void {
    const worker = this.workerPool.find((item) => item.id === workerId);
    if (worker) {
      worker.busy = false;
    }
  }

  /**
   * Process an image using the Go worker
   * @param imageBuffer - The raw image buffer
   * @returns Promise with the WebP and AVIF versions
   */
  async processImage(
    imageBuffer: Buffer,
    options: ProcessImageOptions = {},
  ): Promise<{
    webpBuffer: Buffer | null;
    avifBuffer: Buffer | null;
    error?: string;
  }> {
    const timeout = options.timeout || 30000;
    try {
      // Convert image buffer to base64
      const base64Image = imageBuffer.toString('base64');

      // Prepare input for the Go worker
      const input = JSON.stringify({ fileBuffer: base64Image });

      // Wait for an available worker or timeout
      let workerItem: WorkerPoolItem | null = null;
      const startTime = Date.now();

      while (!workerItem) {
        workerItem = this.getAvailableWorker();

        if (!workerItem) {
          if (Date.now() - startTime > timeout) {
            throw new Error('Timed out waiting for available worker');
          }
          // Wait a short time before checking again
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      const workerId = workerItem.id;
      const worker = workerItem.worker;

      // Write the input to the worker's stdin
      worker.stdin.write(input);
      worker.stdin.end();

      // Collect stdout data
      let outputData = '';
      worker.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      try {
        // Handle completion
        const result = new Promise((resolve, reject) => {
          worker.on('close', (code) => {
            if (code !== 0) {
              this.logger.error(`Worker process exited with code ${code}`);
              return reject(new Error(`Worker process failed with code ${code}`));
            }

            try {
              // Parse the result
              const result = JSON.parse(outputData);

              if (result.error) {
                this.logger.warn(`Worker reported error: ${result.error}`);
                return resolve({
                  webpBuffer: null,
                  avifBuffer: null,
                  error: result.error,
                });
              }

              // Convert base64 strings back to buffers
              const webpBuffer = result.webpBuffer
                ? Buffer.from(result.webpBuffer, 'base64')
                : null;
              const avifBuffer = result.avifBuffer
                ? Buffer.from(result.avifBuffer, 'base64')
                : null;

              return resolve({ webpBuffer, avifBuffer });
            } catch (error) {
              this.logger.error('Failed to parse worker output', error);
              return reject(error);
            }
          });

          worker.on('error', (error) => {
            this.logger.error('Worker process error', error);
            reject(error);
          });
        });

        return result as Promise<{
          webpBuffer: Buffer | null;
          avifBuffer: Buffer | null;
          error?: string;
        }>;
      } finally {
        this.releaseWorker(workerId);
      }
    } catch (error) {
      this.logger.error('Failed to process image', error);
      throw error;
    }
  }
}
