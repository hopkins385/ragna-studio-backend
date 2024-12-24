export class OnboardUserDto {
  userId: string;
  userName: string;
  userEmail: string;
  orgName: string;

  constructor(
    userId: string,
    userName: string,
    userEmail: string,
    orgName: string,
  ) {
    this.userId = userId;
    this.userName = userName;
    this.userEmail = userEmail;
    this.orgName = orgName;
  }

  static fromInput(payload: {
    userId: string;
    userName: string;
    userEmail: string;
    orgName: string;
  }): OnboardUserDto {
    return new OnboardUserDto(
      payload.userId,
      payload.userName,
      payload.userEmail,
      payload.orgName,
    );
  }

  toJson(): any {
    return {
      userId: this.userId,
      userName: this.userName,
      userEmail: this.userEmail,
      orgName: this.orgName,
    };
  }
}
