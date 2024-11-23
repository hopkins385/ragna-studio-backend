export class OnboardUserDto {
  userId: string;
  userName: string;
  orgName: string;

  constructor(userId: string, userName: string, orgName: string) {
    this.userId = userId;
    this.userName = userName;
    this.orgName = orgName;
  }

  static fromInput(payload: {
    userId: string;
    userName: string;
    orgName: string;
  }): OnboardUserDto {
    return new OnboardUserDto(
      payload.userId,
      payload.userName,
      payload.orgName,
    );
  }

  toJson(): any {
    return {
      userId: this.userId,
      userName: this.userName,
      orgName: this.orgName,
    };
  }
}
