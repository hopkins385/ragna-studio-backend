// assistant-tool DTO

export class CreateAssistantToolDto {
  readonly assistantId: string;
  readonly toolId: string;

  constructor(assistantId: string, toolId: string) {
    this.assistantId = assistantId.toLowerCase();
    this.toolId = toolId.toLowerCase();
  }

  static fromInput(input: { assistantId: string; toolId: string }): CreateAssistantToolDto {
    return new CreateAssistantToolDto(input.assistantId, input.toolId);
  }
}
