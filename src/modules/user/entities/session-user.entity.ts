export class SessionUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly lastLoginAt: Date;
  readonly organisationId: string;
  readonly totalCredits: number;

  hasOnboarded: boolean;
  hasEmailVerified: boolean;

  roles: string[];

  activeTeamId: string;
  teams: string[];

  constructor(input: {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    totalCredits: number;
    lastLoginAt: Date;
    hasEmailVerified: boolean;
    hasOnboarded: boolean;
    organisationId: string;
    activeTeamId: string;
    roles: string[];
    teams: string[];
  }) {
    this.id = input.id;
    this.email = input.email;
    this.name = input.name;
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.totalCredits = input.totalCredits;
    this.lastLoginAt = input.lastLoginAt;
    this.hasEmailVerified = input.hasEmailVerified;
    this.hasOnboarded = input.hasOnboarded;
    this.organisationId = input.organisationId;
    this.activeTeamId = input.activeTeamId;
    this.roles = input.roles;
    this.teams = input.teams;
  }

  static fromInput(input: {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    totalCredits: number;
    lastLoginAt: Date;
    hasEmailVerified: boolean;
    hasOnboarded: boolean;
    organisationId: string;
    activeTeamId: string;
    roles: string[];
    teams: string[];
  }): SessionUser {
    return new SessionUser(input);
  }
}
