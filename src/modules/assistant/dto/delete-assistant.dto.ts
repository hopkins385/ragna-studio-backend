import { createZodDto } from 'nestjs-zod';
import { deleteAssistantSchema } from '../schemas/delete-assistant.schema';

export class DeleteAssistantBody extends createZodDto(deleteAssistantSchema) {}

export class DeleteAssistantDto {
  readonly teamId: string;
  readonly assistantId: string;

  constructor(teamId: string, assistantId: string) {
    this.teamId = teamId.toLowerCase();
    this.assistantId = assistantId.toLowerCase();
  }

  static fromInput(input: { teamId: string; id: string }): DeleteAssistantDto {
    return new DeleteAssistantDto(input.teamId, input.id);
  }
}
