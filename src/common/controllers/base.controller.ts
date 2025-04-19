import { HttpException, InternalServerErrorException, Logger } from '@nestjs/common';

/**
 * This is a base controller class that can be extended by other controllers.
 * It provides a logger instance and a method for handling errors.
 */
export class BaseController {
  protected readonly logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * This method handles errors that occur in the controller.
   * If the error is an instance of HttpException, it rethrows it.
   * If the error is an instance of Error, it logs the error and throws an InternalServerErrorException.
   * @param error - The error to handle
   * @throws HttpException or InternalServerErrorException
   */
  protected handleError(error: unknown): void {
    // Handle the error based on its type or properties
    if (error instanceof HttpException) {
      // Handle HttpException
      this.logger.debug(error.stack);
      throw error;
    } else if (error instanceof Error) {
      // Handle generic Error
      this.logger.error(`Error: ${error.message}`, error.stack);
      throw new InternalServerErrorException(error.message);
    } else {
      // Handle other types of errors
      this.logger.error(`Unknown error: ${error}`);
      throw new InternalServerErrorException('An unknown error occurred');
    }
  }
}
