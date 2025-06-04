import { FileValidator } from '@nestjs/common';

export type FileTypeValidatorOptions = {
  fileTypes: string[];
};

export interface IFile {
  mimetype: string;
  size: number;
  path: string;
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

    if (!isFileValid || !file.path || !file.mimetype) {
      return false;
    }

    try {
      return allowedTypes.has(file.mimetype);
    } catch {
      return false;
    }
  }
}
