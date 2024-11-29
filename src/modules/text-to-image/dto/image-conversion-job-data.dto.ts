export class ImageConversionJobDataDto {
  filePathOrUrl: string;
  bucketPath: string;
  fileName: string;

  constructor(filePathOrUrl: string, bucketPath: string, fileName: string) {
    this.filePathOrUrl = filePathOrUrl;
    this.bucketPath = bucketPath;
    this.fileName = fileName;
  }

  static fromInput(input: any): ImageConversionJobDataDto {
    return new ImageConversionJobDataDto(
      input.filePathOrUrl,
      input.bucketPath,
      input.fileName,
    );
  }
}
