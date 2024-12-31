export class UploadFileDto {
  readonly file: Express.Multer.File;
  readonly userId: string;
  readonly teamId: string;

  constructor(file: Express.Multer.File, userId: string, teamId: string) {
    this.file = file;
    this.userId = userId;
    this.teamId = teamId;
  }

  static fromInput(input: {
    file: Express.Multer.File;
    userId: string;
    teamId: string;
  }): UploadFileDto {
    return new UploadFileDto(input.file, input.userId, input.teamId);
  }
}
