export class SessionUserEntity {
  readonly id: string;
  readonly organisationId: string;
  readonly onboardedAt: Date | null;
  readonly roles: string[];

  activeTeamId: string;

  constructor({
    id,
    organisationId,
    activeTeamId,
    onboardedAt,
    roles,
  }: {
    id: string;
    organisationId: string;
    activeTeamId: string;
    onboardedAt: Date | null;
    roles: string[];
  }) {
    this.id = id;
    this.organisationId = organisationId;
    this.activeTeamId = activeTeamId;
    this.onboardedAt = onboardedAt;
    this.roles = roles;
  }

  static fromInput({
    id,
    organisationId,
    activeTeamId,
    onboardedAt,
  }: {
    id: string;
    organisationId: string;
    activeTeamId: string;
    onboardedAt: Date | null;
    roles: string[];
  }): SessionUserEntity {
    return new SessionUserEntity({
      id,
      organisationId,
      activeTeamId,
      onboardedAt,
      roles: [],
    });
  }
}
