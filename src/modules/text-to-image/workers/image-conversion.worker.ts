import { parentPort, isMainThread } from 'worker_threads';
import sharp from 'sharp';

interface WorkerResult {
  avifBuffer: Buffer;
  webpBuffer: Buffer;
  error?: any;
}

if (!isMainThread && parentPort) {
  console.log(`Image conversion worker process ID: ${process.pid}`);
  // sharp.cache({ items: 20 }); // reduce cache items
  parentPort.on('message', async (fileBuffer: Buffer) => {
    try {
      const avifBufferPromise = sharp(fileBuffer).resize(300).avif().toBuffer();
      const webpBufferPromise = sharp(fileBuffer).resize(300).webp().toBuffer();

      const [avifBuffer, webpBuffer] = await Promise.all([
        avifBufferPromise,
        webpBufferPromise,
      ]);

      const result: WorkerResult = { avifBuffer, webpBuffer };
      parentPort.postMessage(result);
    } catch (error) {
      console.error('Error processing image in worker:', error);
      const result: WorkerResult = {
        avifBuffer: Buffer.from(''), // Provide empty buffers
        webpBuffer: Buffer.from(''), // Provide empty buffers
        error: error,
      };
      parentPort.postMessage(result);
    }
  });
}
