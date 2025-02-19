export class SessionUser {
  id: string;

  email: string;

  name: string;

  firstName: string;

  lastName: string;

  totalCredits: number;

  lastLoginAt: Date;

  hasEmailVerified: Boolean;

  hasOnboarded: Boolean;

  // custom
  firstTeamId: string;
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
    hasEmailVerified: Boolean;
    hasOnboarded: Boolean;
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
    hasEmailVerified: Boolean;
    hasOnboarded: Boolean;
    firstTeamId: string;
    roles: string[];
    teams: string[];
  }): SessionUser {
    return new SessionUser(input);
  }
}
