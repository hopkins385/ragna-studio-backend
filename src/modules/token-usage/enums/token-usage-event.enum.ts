export const TokenUsageEvent = {
  LOG_USAGE: 'token.log-usage',
} as const;

export type TokenUsageEvent =
  (typeof TokenUsageEvent)[keyof typeof TokenUsageEvent];
