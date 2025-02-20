export class SessionUser {
  id: string;

  email: string;

  name: string;

  firstName: string;

  lastName: string;

  totalCredits: number;

  lastLoginAt: Date;

  // custom
  organisationId: string;
  firstTeamId: string;
  hasOnboarded: boolean;
  hasEmailVerified: boolean;
  credits: number;

  roles: string[];
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
    firstTeamId: string;
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
    this.firstTeamId = input.firstTeamId;
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
    firstTeamId: string;
    roles: string[];
    teams: string[];
  }): SessionUser {
    return new SessionUser(input);
  }
}
