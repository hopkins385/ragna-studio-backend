import { BadRequestException, Logger } from '@nestjs/common';

export abstract class BaseService<T> {
  protected readonly logger: Logger;

  constructor(loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  protected validateId(id: string | undefined, fieldName: string = 'ID'): void {
    if (!id) {
      throw new BadRequestException(`${fieldName} is required`);
    }
  }

  abstract create(payload: any): Promise<T>;
  abstract getOne(payload: any): Promise<T>;
  abstract getMany(payload: any): Promise<T[]>;
  abstract findAll(payload: any): Promise<any>;
  abstract update(payload: any): Promise<T>;
  abstract softDelete(payload: any): Promise<boolean>;
  abstract delete(payload: any): Promise<boolean>;
}
