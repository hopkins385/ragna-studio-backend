import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { mkdir, readdir, readFile, rmdir, unlink, writeFile } from 'fs/promises';
import { basename, dirname, join } from 'path';
import { UploadFileDto } from '@/modules/upload/dto/file-upload.dto';
import { CreateMediaDto } from '@/modules/media/dto/create-media.dto';
import { PassThrough } from 'stream';
import type { AxiosInstance } from 'axios';
import { randomCUID2 } from '@/common/utils/random-cuid2';
import { HTTP_CLIENT } from '@/modules/http-client/constants';

type Bucket = 'images';
type R2Bucket = 'ragna-studio-images';

interface BucketSettings {
  bucket: R2Bucket;
  url: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;

  constructor(
    private readonly config: ConfigService,
    @Inject(HTTP_CLIENT)
    private readonly httpClient: AxiosInstance,
  ) {
    this.s3Client = new S3Client({
      region: this.config.get<string>('CF_REGION', 'auto'),
      endpoint: `https://${this.config.get('CF_ACCOUNT_ID')}.eu.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.get<string>('CF_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get<string>('CF_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(payload: UploadFileDto): Promise<CreateMediaDto> {
    if (!payload.file.mimetype) {
      throw new Error('File mimetype is required.');
    }
    const mimeType = this.getFileExtension(payload.file.mimetype);
    if (!mimeType) {
      throw new Error('Unsupported file type: ' + payload.file.mimetype);
    }

    const basePath = this.getBasePath();
    const userPath = join(basePath, payload.userId);

    if (!existsSync(basePath)) {
      await mkdir(basePath);
    }

    if (!existsSync(userPath)) {
      await mkdir(userPath);
    }

    const originalFilename = payload.file.originalname ?? 'Untitled';
    const fileName = `${Date.now()}-${randomCUID2()}.${mimeType}`;
    const newPath = `${join(this.getBasePath(), payload.userId, fileName)}`;

    try {
      const buffer = payload.file.buffer;
      await writeFile(newPath, buffer);

      const createMediaPayload = CreateMediaDto.fromInput({
        teamId: payload.teamId,
        name: originalFilename,
        fileName,
        filePath: newPath,
        fileMime: payload.file.mimetype,
        fileSize: payload.file.size,
        model: { id: payload.teamId, type: 'team' }, // TODO: client can decide the model type
      });

      return createMediaPayload;
    } catch (error: any) {
      this.logger.error(`Error copying file: ${error?.message}`);
      throw new Error('Error copying file');
    }
  }

  getBucketSettings(bucket: Bucket): BucketSettings {
    switch (bucket) {
      case 'images':
        return {
          bucket: 'ragna-studio-images',
          url: 'https://images.ragna.io',
        };
      default:
        throw new Error('Invalid bucket');
    }
  }

  async uploadFileToBucketByUrl(payload: {
    fileName: string;
    fileUrl: string;
    bucket: Bucket;
    bucketFolder: string;
  }) {
    const { fileName, fileUrl, bucketFolder } = payload;
    const { bucket, url } = this.getBucketSettings(payload.bucket);
    const newPath = `${url}/uploads/${bucketFolder}/${fileName}`;

    try {
      const localFilePath = await this.downloadFileToTemp(fileUrl);
      const fileBlob = await readFile(localFilePath);

      const mimeType = this.getFileExtension(fileName);

      const putObjectCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: `uploads/${bucketFolder}/${fileName}`,
        Body: fileBlob,
        ContentType: mimeType,
      });

      await this.s3Client.send(putObjectCommand);

      await this.deleteTempFile(localFilePath);

      return {
        filePath: newPath,
        fileMime: mimeType,
      };
    } catch (error: any) {
      this.logger.error(`Error uploading file to bucket', ${error?.message}`);
      throw error;
    }
  }

  async uploadToBucketByUrl(payload: {
    fileName: string;
    fileMimeType: string;
    fileUrl: string;
    bucket: Bucket;
    bucketFolder: string;
  }) {
    const { fileName, fileMimeType, fileUrl, bucketFolder } = payload;
    const { bucket, url } = this.getBucketSettings(payload.bucket);
    const newfileUrl = `${url}/${bucketFolder}/${fileName}`;

    try {
      const response = await this.httpClient({
        url: fileUrl,
        method: 'GET',
        responseType: 'stream',
      });

      const contentLength = response.headers['content-length'];

      this.logger.debug(`Upload by url, Content-Length: ${contentLength}`);

      const passThroughStream = new PassThrough();
      response.data.pipe(passThroughStream);

      const params = {
        Bucket: bucket,
        Key: `${bucketFolder}/${fileName}`,
        Body: passThroughStream,
        ContentType: fileMimeType,
        ContentLength: contentLength ? parseInt(contentLength) : undefined,
      };

      /*const putObjectCommand = new PutObjectCommand(params);
      await this.s3Client.send(putObjectCommand);
      */

      const uploadFileToBucket = new Upload({
        client: this.s3Client,
        params,
      });

      await uploadFileToBucket.done();

      return {
        storagefileUrl: newfileUrl,
      };
    } catch (error: any) {
      this.logger.error(`Error uploading file to bucket', ${error?.message}`);
      throw error;
    }
  }

  async uploadFileToBucket(bucket: Bucket, payload: UploadFileDto): Promise<CreateMediaDto> {
    if (!payload.file.mimetype) {
      throw new Error('File mimetype is required.');
    }
    const mimeType = this.getFileExtension(payload.file.mimetype);
    if (!mimeType) {
      throw new Error('Unsupported file type: ' + payload.file.mimetype);
    }
    const originalFilename = payload.file.originalname ?? 'Untitled';
    const fileName = `${Date.now()}-${randomCUID2()}.${mimeType}`;
    const { bucket: Bucket, url } = this.getBucketSettings(bucket);
    const bucketFilePath = `${payload.userId}/uploads/${bucket}/${fileName}`;
    const bucketUrl = `${url}/${payload.userId}/uploads/${bucket}/${fileName}`;

    try {
      const buffer = payload.file.buffer;
      if (!buffer || buffer.length < 1) {
        throw new Error('File buffer is required.');
      }

      const putObjectCommand = new PutObjectCommand({
        Bucket,
        Key: bucketFilePath,
        Body: buffer,
        ContentType: payload.file.mimetype,
        ContentLength: payload.file.size,
      });

      await this.s3Client.send(putObjectCommand);

      // wait 1000ms
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: this should be removed and placed in a separate service
      const createMediaPayload = CreateMediaDto.fromInput({
        teamId: payload.teamId,
        name: originalFilename,
        fileName,
        filePath: bucketUrl,
        fileMime: payload.file.mimetype,
        fileSize: payload.file.size,
        model: { id: payload.userId, type: 'user' },
      });

      return createMediaPayload;
    } catch (error: any) {
      this.logger.error(`Error uploading file to bucket: ${error?.message}`);
      throw new Error('Error uploading file to bucket');
    }
  }

  /**
   * Uploads a buffer to a bucket
   * @param bucket
   * @param payload
   */
  async uploadBufferToBucket(
    bucket: Bucket,
    payload: {
      bucketPath: string;
      fileBuffer: Buffer;
      fileName: string;
      fileExtension: string;
    },
  ) {
    //
    const { bucket: theBucket, url } = this.getBucketSettings(bucket);
    const fileMimeType = this.getMimeType(payload.fileExtension);

    const putObjectCommand = new PutObjectCommand({
      Bucket: theBucket,
      Key: `${payload.bucketPath}/${payload.fileName}`,
      Body: payload.fileBuffer,
      ContentType: fileMimeType,
      ContentLength: payload.fileBuffer.length,
    });

    await this.s3Client.send(putObjectCommand);

    const newFilePath = `${url}/${payload.bucketPath}/${payload.fileName}`;

    this.logger.debug(`Uploaded file to bucket, newFilePath: ${newFilePath}`);

    return {
      fileName: payload.fileName,
      filePath: newFilePath,
      fileMimeType: fileMimeType,
      fileSize: payload.fileBuffer.length,
    };
  }

  async downloadFromBucket(payload: { bucket: Bucket; bucketPath: string }) {
    const { bucket, bucketPath } = payload;
    const { bucket: theBucket, url } = this.getBucketSettings(bucket);

    const getObjectCommand = new GetObjectCommand({
      Bucket: theBucket,
      Key: bucketPath,
    });

    try {
      const { Body } = await this.s3Client.send(getObjectCommand);
      if (!Body) throw new Error('File not found');

      const chunks: Uint8Array[] = [];
      for await (const chunk of Body as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      return buffer;
    } catch (error) {
      this.logger.error('Error downloading file from bucket', error);
      throw error;
    }
  }

  async downloadFileFromBucketToTemp(vpath: string): Promise<string> {
    throw new Error('Method not implemented.');
    /*
    const buffer = await this.downloadFileFromBucket(vpath);
    if (!buffer) throw new Error('File not found');
    const fpath = join(process.cwd(), 'temp', vpath);
    await mkdir(dirname(fpath), { recursive: true });
    await writeFile(fpath, buffer, 'binary');
    return fpath;
    */
  }

  async downloadFileToTemp(url: string): Promise<string> {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const fpath = join(process.cwd(), 'temp', 'files', randomUUID(), basename(url));
    await mkdir(dirname(fpath), { recursive: true });
    await writeFile(fpath, buffer, 'binary');
    return fpath;
  }

  async deleteTempFile(filePath: string): Promise<boolean> {
    await unlink(filePath);
    // delete also the directory if it's empty
    const dir = dirname(filePath);
    const files = await readdir(dir);
    if (files.length === 0) {
      await rmdir(dir);
    }
    return true;
  }

  async deleteFileFromBucket({
    filePath,
    bucketName,
  }: {
    filePath: string;
    bucketName?: Bucket;
  }): Promise<boolean> {
    const bucketSettings = this.getBucketSettings(bucketName ?? 'images');
    const cleanedFilePath = filePath.replace(`${bucketSettings.url}/`, '');

    this.logger.debug(
      `Deleting file from bucket ${bucketSettings.bucket} at filePath: ${cleanedFilePath}`,
    );

    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: bucketSettings.bucket,
      Key: cleanedFilePath,
    });

    try {
      await this.s3Client.send(deleteObjectCommand);
    } catch (error: any) {
      this.logger.error(`Error deleting file from bucket: ${error?.message}`);
      throw new Error('Error deleting file from bucket');
    }

    return true;
  }

  // HELPERS

  async downloadFileFromUrl(url: string): Promise<Buffer> {
    try {
      const response = await this.httpClient.get(url, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error: any) {
      this.logger.error(` Error downloading file from url: ${url}: ${error?.message}`);
      throw error;
    }
  }

  getFileExtension(mimeType: string) {
    return {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/markdown': 'md',
      'text/csv': 'csv',
      'text/html': 'html',
      'text/plain': 'txt',
      plain: 'txt',
      'image/png': 'png',
      'image/jpg': 'jpg',
      'image/jpeg': 'jpeg',
      'image/gif': 'gif',
      'image/webp': 'webp',
    }[mimeType];
  }

  getMimeType(extension: string) {
    return {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      md: 'text/markdown',
      csv: 'text/csv',
      html: 'text/html',
      txt: 'text/plain',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
    }[extension];
  }

  async deleteFileBy({ userId, fileName }: { userId: string; fileName: string }) {
    const filePath = join(this.getBasePath(), userId, fileName);
    return this.deleteFile({ filePath });
  }

  async deleteFile({ filePath }: { filePath: string }) {
    return unlink(filePath);
  }
  getBasePath() {
    return join(process.cwd(), 'uploads');
  }
}
