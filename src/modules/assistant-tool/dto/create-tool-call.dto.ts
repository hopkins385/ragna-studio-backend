type Json = Record<string, any> | Json[] | null | undefined;

export class CreateToolCallDto {
  readonly assistantId: string;
  readonly toolId: string;
  readonly input: Json;
  readonly output: Json;

  constructor(assistantId: string, toolId: string, input: Json, output: Json) {
    this.assistantId = assistantId;
    this.toolId = toolId;
    this.input = input;
    this.output = output;
  }

  static fromInput(input: {
    assistantId: string;
    toolId: string;
    input: Json;
    output: Json;
  }): CreateToolCallDto {
    return new CreateToolCallDto(input.assistantId, input.toolId, input.input, input.output);
  }
}
