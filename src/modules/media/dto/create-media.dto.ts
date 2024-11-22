export class CreateMediaDto {
  readonly teamId: string;
  readonly name: string;
  readonly fileName: string;
  readonly filePath: string;
  readonly fileMime: string;
  readonly fileSize: number;
  readonly model: { id: string; type: string };

  constructor(
    teamId: string,
    name: string,
    fileName: string,
    filePath: string,
    fileMime: string,
    fileSize: number,
    model: { id: string; type: string },
  ) {
    this.teamId = teamId.toLowerCase();
    this.name = name;
    this.fileName = fileName;
    this.filePath = filePath;
    this.fileMime = fileMime;
    this.fileSize = fileSize;
    this.model = model;
  }

  static fromInput(input: {
    teamId: string;
    name: string;
    fileName: string;
    filePath: string;
    fileMime: string;
    fileSize: number;
    model: { id: string; type: string };
  }): CreateMediaDto {
    return new CreateMediaDto(
      input.teamId,
      input.name,
      input.fileName,
      input.filePath,
      input.fileMime,
      input.fileSize,
      input.model,
    );
  }
}
