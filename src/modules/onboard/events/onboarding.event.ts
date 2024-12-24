export class OnboardingCompletedDto {
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;

  constructor(userId: string, userName: string, userEmail: string) {
    this.userId = userId;
    this.userName = userName;
    this.userEmail = userEmail;
  }

  static fromInput({
    userId,
    payload,
  }: {
    userId: string;
    payload: { userName: string; orgName: string; userEmail: string };
  }) {
    return new this(userId, payload.userName, payload.userEmail);
  }
}
