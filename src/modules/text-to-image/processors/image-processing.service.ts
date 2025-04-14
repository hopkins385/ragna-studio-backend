import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);
  private readonly workerPath = join(process.cwd(), 'bin', 'image-worker');

  constructor() {
    this.logger.debug(`Using worker path: ${this.workerPath}`);
  }

  /**
   * Process an image using the Go worker
   * @param imageBuffer - The raw image buffer
   * @returns Promise with the WebP and AVIF versions
   */
  async processImage(imageBuffer: Buffer): Promise<{
    webpBuffer: Buffer | null;
    avifBuffer: Buffer | null;
    error?: string;
  }> {
    try {
      // Convert image buffer to base64
      const base64Image = imageBuffer.toString('base64');

      // Prepare input for the Go worker
      const input = JSON.stringify({ fileBuffer: base64Image });

      // Spawn the Go worker process
      const worker = spawn(this.workerPath);

      // Write the input to the worker's stdin
      worker.stdin.write(input);
      worker.stdin.end();

      // Collect stdout data
      let outputData = '';
      worker.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      // Handle completion
      return new Promise((resolve, reject) => {
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
            const webpBuffer = result.webpBuffer ? Buffer.from(result.webpBuffer, 'base64') : null;
            const avifBuffer = result.avifBuffer ? Buffer.from(result.avifBuffer, 'base64') : null;

            // kill the worker process
            worker.kill();
            this.logger.debug('Worker process completed successfully');

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
    } catch (error) {
      this.logger.error('Failed to process image', error);
      throw error;
    }
  }
}
