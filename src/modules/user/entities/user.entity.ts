import { Team } from '@prisma/client';

export class UserEntity {
  id: string;

  email: string;

  name: string;

  firstName: string;

  lastName: string;

  totalCredits: number;

  lastLoginAt: Date;

  emailVerified: Date;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date;

  onboardedAt: Date;

  // custom
  organisationId: string;
  hasOnboarded: boolean;
  hasEmailVerified: boolean;

  // required relations after onboarding
  roles?: string[];
  teams?: {
    team?: Partial<Team>;
  }[];

  constructor(input: UserEntity) {
    this.id = input.id;
    this.email = input.email;
    this.name = input.name;
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.totalCredits = input.totalCredits;
    this.lastLoginAt = input.lastLoginAt;
    this.emailVerified = input.emailVerified;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
    this.deletedAt = input.deletedAt;
    this.onboardedAt = input.onboardedAt;
    this.roles = input.roles;
    this.teams = input.teams;
    this.organisationId = input.teams?.[0]?.team.organisationId || '';
    this.hasOnboarded = input.onboardedAt !== null;
    this.hasEmailVerified = input.emailVerified !== null;
  }

  static fromInput(input: any) {
    return new UserEntity(input);
  }
}
