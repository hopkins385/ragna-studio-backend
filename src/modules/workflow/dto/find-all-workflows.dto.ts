export class FindAllWorkflowsDto {
  readonly teamId: string;
  readonly page: number;
  readonly limit?: number;

  constructor(teamId: string, page: number, limit?: number) {
    this.teamId = teamId.toLowerCase();
    this.page = page;
    this.limit = limit || 10;
  }

  static fromInput(input: {
    teamId: string;
    page: number;
    limit?: number;
  }): FindAllWorkflowsDto {
    return new FindAllWorkflowsDto(input.teamId, input.page, input.limit);
  }
}
