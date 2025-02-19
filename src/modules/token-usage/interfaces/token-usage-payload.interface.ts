export interface TokenUsagePayload {
  userId: string;
  modelId: string;
  tokens: {
    total: number;
    prompt: number;
    completion: number;
    reasoning: number;
  };
}
