import { Credit, Team } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;

  email: string;

  name: string;

  firstName: string;

  lastName: string;

  lastLoginAt: Date;

  emailVerified: Date;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date;

  onboardedAt: Date;

  // custom
  firstTeamId: string;
  totalCredits: number;

  // required relations
  credit?: Partial<Credit>[];
  roles?: string[];
  teams?: {
    team: Partial<Team>;
  }[];

  constructor(input: UserEntity) {
    this.id = input.id;
    this.email = input.email;
    this.name = input.name;
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.lastLoginAt = input.lastLoginAt;
    this.emailVerified = input.emailVerified;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
    this.deletedAt = input.deletedAt;
    this.onboardedAt = input.onboardedAt;
    this.credit = input.credit;
    this.roles = input.roles;
    this.teams = input.teams;
    this.firstTeamId = input.teams[0].team.id;
    this.totalCredits = input.credit.reduce((acc, c) => acc + c.amount, 0);
  }

  static fromInput(input: any) {
    return new UserEntity(input);
  }
}
