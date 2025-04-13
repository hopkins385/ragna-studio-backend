interface Organisation {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

export class DetailedUserEntity {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
    readonly image: string,
    readonly roles: Role[],
    readonly teams: Team[],
    readonly organisation: Organisation,
    readonly lastLoginAt: Date,
    readonly onboardedAt: Date,
    readonly emailVerifiedAt: Date,
  ) {}

  static fromInput(input: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    image: string;
    roles: Role[];
    teams: Team[];
    organisation: Organisation;
    lastLoginAt: Date;
    onboardedAt: Date;
    emailVerifiedAt: Date;
  }) {
    return new DetailedUserEntity(
      input.id,
      input.name,
      input.firstName,
      input.lastName,
      input.email,
      input.image,
      input.roles,
      input.teams,
      input.organisation,
      input.lastLoginAt,
      input.onboardedAt,
      input.emailVerifiedAt,
    );
  }
}
