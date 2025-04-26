import { FileValidator } from '@nestjs/common';

export type FileTypeValidatorOptions = {
  fileTypes: string[];
};

export interface IFile {
  mimetype: string;
  size: number;
  buffer?: Buffer;
}

export class CustomFileTypeValidator extends FileValidator<FileTypeValidatorOptions, IFile> {
  public buildErrorMessage(file?: IFile): string {
    const expected = this.validationOptions.fileTypes.join(', ');
    if (!file || !file.mimetype) {
      return `Validation failed (expected file type is ${expected})`;
    }
    return `Validation failed (current file type is ${file.mimetype}, expected type is ${expected})`;
  }

  public async isValid(file: Express.Multer.File): Promise<boolean> {
    const allowedTypes = new Set(this.validationOptions.fileTypes);
    const isFileValid = !!file && 'mimetype' in file;

    if (!isFileValid || !file.buffer) {
      return false;
    }

    if (file.mimetype === 'audio/webm' && allowedTypes.has('audio/webm')) {
      return true;
    }

    try {
      // TODO: get rid of eval
      const { fileTypeFromBuffer } = (await eval(
        'import ("file-type")',
      )) as typeof import('file-type');

      const detectedFileType = await fileTypeFromBuffer(file.buffer);

      if (!detectedFileType) {
        // console.warn(
        //   `Could not determine file type from buffer for file originally identified as ${file.mimetype}`,
        // );
        return false;
      }

      // console.log(
      //   `Detected file type: ${detectedFileType.ext} (${detectedFileType.mime})`,
      //   `Original file type: ${file.mimetype}`,
      // );

      return !!detectedFileType && allowedTypes.has(detectedFileType.mime);
    } catch {
      return false;
    }
  }
}
