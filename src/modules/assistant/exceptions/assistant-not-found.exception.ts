import { NotFoundException } from '@nestjs/common';

export class AssistantNotFoundException extends NotFoundException {
  constructor(assistantId: string) {
    super(`Assistant with id ${assistantId} not found`);
  }
}
