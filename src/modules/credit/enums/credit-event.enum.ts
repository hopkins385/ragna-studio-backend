export const CreditEvent = {
  Used: 'credit.used',
} as const;

export type CreditEvent = (typeof CreditEvent)[keyof typeof CreditEvent];
