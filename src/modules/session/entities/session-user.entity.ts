export class SessionUserEntity {
  public readonly id: string;
  public readonly organisationId: string;
  public readonly onboardedAt: Date | null;
  public readonly roles: string[];
  public readonly teams: string[];
  public activeTeamId: string;

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
