export class TokenUsageEventDto {
  readonly userId: string;
  readonly modelId: string;
  readonly tokens: {
    prompt: number;
    completion: number;
    reasoning: number;
    total: number;
  };

  constructor(
    userId: string,
    modelId: string,
    tokens: {
      prompt: number;
      completion: number;
      reasoning: number;
      total: number;
    },
  ) {
    this.userId = userId;
    this.modelId = modelId;
    this.tokens = tokens;
  }

  static fromInput(input: {
    userId: string;
    modelId: string;
    tokens: {
      prompt: number;
      completion: number;
      reasoning: number;
      total: number;
    };
  }): TokenUsageEventDto {
    return new TokenUsageEventDto(input.userId, input.modelId, input.tokens);
  }
}
