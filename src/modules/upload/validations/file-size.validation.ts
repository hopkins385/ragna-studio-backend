import { Injectable, FileValidator } from '@nestjs/common';
import { IFile } from '@nestjs/common/pipes/file/interfaces';

@Injectable()
export class FilesCountValidator extends FileValidator {
  private readonly maxCount: number;
  constructor({ maxCount }: { maxCount: number }) {
    super({ maxCount });
    this.maxCount = maxCount;
  }

  async isValid(files: IFile | IFile[]) {
    if (!Array.isArray(files)) {
      return true;
    }
    return files.length <= this.maxCount;
  }

  buildErrorMessage() {
    return `Maximum file count exceeded. Maximum allowed file count is ${this.maxCount}.`;
  }
}
