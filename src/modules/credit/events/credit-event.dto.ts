export class CreditEventDto {
  readonly userId: string;
  readonly creditAmount: number;

  constructor(userId: string, creditAmount: number) {
    this.userId = userId;
    this.creditAmount = creditAmount;
  }

  static fromInput(input: {
    userId: string;
    creditAmount: number;
  }): CreditEventDto {
    return new CreditEventDto(input.userId, input.creditAmount);
  }
}
