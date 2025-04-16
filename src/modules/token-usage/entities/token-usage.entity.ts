interface TokenUsageEntityInput {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  createdAt: Date;
  promptPrice: number;
  completionPrice: number;
  totalPrice: number;
  llm: {
    provider: string;
    displayName: string;
  };
}

export class TokenUsageEntity {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
  readonly createdAt: Date;
  readonly promptPrice: number;
  readonly completionPrice: number;
  readonly totalPrice: number;
  readonly llm: {
    provider: string;
    displayName: string;
  };

  constructor(payload: TokenUsageEntityInput) {
    this.promptTokens = payload.promptTokens;
    this.completionTokens = payload.completionTokens;
    this.totalTokens = payload.totalTokens;
    this.createdAt = payload.createdAt;
    this.promptPrice = payload.promptPrice;
    this.completionPrice = payload.completionPrice;
    this.totalPrice = payload.totalPrice;
    this.llm = {
      provider: payload.llm.provider,
      displayName: payload.llm.displayName,
    };
  }

  static fromInput(input: TokenUsageEntityInput): TokenUsageEntity {
    return new TokenUsageEntity(input);
  }
}
