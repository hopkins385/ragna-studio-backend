interface Organisation {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
}

export class UserAccountEntity {
  readonly hasOnboarded: boolean;
  readonly hasEmailVerified: boolean;

  constructor(
    readonly id: string,
    readonly name: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
    readonly image: string,
    readonly roles: string[],
    readonly activeTeamId: string,
    readonly teams: Team[],
    readonly organisation: Organisation,
    readonly lastLoginAt: Date,
    readonly onboardedAt: Date,
    readonly emailVerifiedAt: Date,
  ) {
    this.hasOnboarded = !!onboardedAt;
    this.hasEmailVerified = !!emailVerifiedAt;
  }

  static fromInput(input: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    image: string;
    activeTeamId: string;
    roles: string[];
    teams: Team[];
    organisation: Organisation;
    lastLoginAt: Date;
    onboardedAt: Date;
    emailVerifiedAt: Date;
  }) {
    return new UserAccountEntity(
      input.id,
      input.name,
      input.firstName,
      input.lastName,
      input.email,
      input.image,
      input.roles,
      input.activeTeamId,
      input.teams,
      input.organisation,
      input.lastLoginAt,
      input.onboardedAt,
      input.emailVerifiedAt,
    );
  }
}
