interface ImageConversionJobDataDtoInput {
  runId: string;
  imageId: string;
  filePathOrUrl: string;
  bucketPath: string;
  fileName: string;
}

export class ImageConversionJobDataDto {
  runId: string;
  imageId: string;
  filePathOrUrl: string;
  bucketPath: string;
  fileName: string;

  constructor(
    runId: string,
    imageId: string,
    filePathOrUrl: string,
    bucketPath: string,
    fileName: string,
  ) {
    this.runId = runId;
    this.imageId = imageId;
    this.filePathOrUrl = filePathOrUrl;
    this.bucketPath = bucketPath;
    this.fileName = fileName;
  }

  static fromInput(input: ImageConversionJobDataDtoInput): ImageConversionJobDataDto {
    return new ImageConversionJobDataDto(
      input.runId,
      input.imageId,
      input.filePathOrUrl,
      input.bucketPath,
      input.fileName,
    );
  }
}
