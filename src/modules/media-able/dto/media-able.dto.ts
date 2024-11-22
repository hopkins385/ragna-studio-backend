import { getMediaAbleTypeEnumValue } from '@/modules/media-able/enum/media-able.enum';

export class MediaAbleDto {
  readonly id: string;
  readonly type: number;

  constructor(id: string, type: string) {
    this.id = id.toLowerCase();
    this.type = getMediaAbleTypeEnumValue(type);
  }

  static fromInput(input: { id: string; type: string }): MediaAbleDto {
    return new MediaAbleDto(input.id, input.type);
  }
}
