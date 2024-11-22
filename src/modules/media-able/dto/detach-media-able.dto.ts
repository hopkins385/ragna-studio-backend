import { MediaAbleDto } from './media-able.dto';

export class DetachMediaAbleDto {
  readonly model: MediaAbleDto;

  constructor(input: { id: string; type: string }) {
    this.model = MediaAbleDto.fromInput({
      id: input.id,
      type: input.type,
    });
  }

  static fromInput(model: { id: string; type: string }): DetachMediaAbleDto {
    return new DetachMediaAbleDto(model);
  }
}
