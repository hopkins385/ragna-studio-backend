// src/modules/user/entities/request-user.entity.ts
interface CreateRequestUser {
  id: string;
  sessionId: string;
  organisationId: string;
  activeTeamId: string;
  onboardedAt: Date | null;
  roles: string[];
  teams: string[];
}

export class RequestUser {
  readonly id: string;
  readonly sessionId: string;
  readonly organisationId: string;
  readonly activeTeamId: string;
  readonly onboardedAt: Date | null;
  readonly roles: string[];
  readonly teams: string[];

  constructor({
    id,
    onboardedAt,
    sessionId,
    organisationId,
    activeTeamId,
    roles,
    teams,
  }: CreateRequestUser) {
    this.id = id;
    this.sessionId = sessionId;
    this.organisationId = organisationId;
    this.activeTeamId = activeTeamId;
    this.onboardedAt = onboardedAt;
    this.roles = roles;
    this.teams = teams;
  }

  static fromInput(input: CreateRequestUser): RequestUser {
    return new RequestUser(input);
  }
}
