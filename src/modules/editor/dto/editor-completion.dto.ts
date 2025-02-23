export class EditorCompletionDto {
  readonly userId: string;
  readonly instructions: string;
  readonly selectedText: string;
  readonly context: string;

  constructor(userId: string, instructions: string, selectedText: string, context: string) {
    this.userId = userId.toLowerCase();
    this.instructions = instructions;
    this.selectedText = selectedText;
    this.context = context;
  }

  static fromInput(input: {
    userId: string;
    instructions: string;
    selectedText: string;
    context: string;
  }): EditorCompletionDto {
    return new EditorCompletionDto(
      input.userId,
      input.instructions,
      input.selectedText,
      input.context,
    );
  }
}
