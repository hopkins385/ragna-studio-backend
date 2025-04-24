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
    const isFileValid = !!file && 'mimetype' in file;

    if (!isFileValid || !file.buffer) {
      return false;
    }

    try {
      // TODO: get rid of eval
      const { fileTypeFromBuffer } = (await eval(
        'import ("file-type")',
      )) as typeof import('file-type');

      const fileType = await fileTypeFromBuffer(file.buffer);

      const allowedTypes = new Set(this.validationOptions.fileTypes);
      return !!fileType && allowedTypes.has(fileType.mime);
    } catch {
      return false;
    }
  }
}
