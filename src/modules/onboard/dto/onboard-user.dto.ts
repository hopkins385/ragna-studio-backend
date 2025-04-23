export class OnboardUserDto {
  userId: string;
  userName: string;
  userEmail: string;
  orgName: string;
  sessionId: string;

  constructor(
    userId: string,
    userName: string,
    userEmail: string,
    orgName: string,
    sessionId: string,
  ) {
    this.userId = userId;
    this.userName = userName;
    this.userEmail = userEmail;
    this.orgName = orgName;
    this.sessionId = sessionId;
  }

  static fromInput(payload: {
    userId: string;
    userName: string;
    userEmail: string;
    orgName: string;
    sessionId: string;
  }): OnboardUserDto {
    return new OnboardUserDto(
      payload.userId,
      payload.userName,
      payload.userEmail,
      payload.orgName,
      payload.sessionId,
    );
  }
}
