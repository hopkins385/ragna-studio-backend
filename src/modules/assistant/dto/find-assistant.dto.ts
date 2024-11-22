export class FindAssistantDto {
  readonly assistantId: string;

  constructor(assistantId: string) {
    this.assistantId = assistantId.toLowerCase();
  }

  static fromInput(input: { id: string }): FindAssistantDto {
    return new FindAssistantDto(input.id);
  }
}
