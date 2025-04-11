export class SessionUserEntity {
  readonly id: string;
  readonly organisationId: string;
  readonly onboardedAt: Date | null;
  readonly roles: string[];
  readonly teams: string[];

  activeTeamId: string;

  constructor({
    id,
    organisationId,
    activeTeamId,
    onboardedAt,
    roles,
    teams,
  }: {
    id: string;
    organisationId: string;
    activeTeamId: string;
    onboardedAt: Date | null;
    roles: string[];
    teams: string[];
  }) {
    this.id = id;
    this.organisationId = organisationId;
    this.activeTeamId = activeTeamId;
    this.onboardedAt = onboardedAt;
    this.roles = roles;
    this.teams = teams;
  }

  static fromInput({
    id,
    organisationId,
    activeTeamId,
    onboardedAt,
    roles,
    teams,
  }: {
    id: string;
    organisationId: string;
    activeTeamId: string;
    onboardedAt: Date | null;
    roles: string[];
    teams: string[];
  }): SessionUserEntity {
    return new SessionUserEntity({
      id,
      organisationId,
      activeTeamId,
      onboardedAt,
      roles,
      teams,
    });
  }
}
