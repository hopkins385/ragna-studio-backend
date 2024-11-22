export class MediaAbleResponseDto {
  readonly id: string;
  readonly mediaId: string;
  readonly mediaName: string;

  constructor(id: string, mediaId: string, name: string) {
    this.id = id;
    this.mediaId = mediaId;
    this.mediaName = name;
  }

  static fromMediaAble(mediaAble: { id: string; mediaId: string; name: string }): MediaAbleResponseDto {
    return new MediaAbleResponseDto(mediaAble.id, mediaAble.mediaId, mediaAble.name);
  }
}

export class MediaAblesResponseDto {
  readonly mediaAbles: MediaAbleResponseDto[];

  constructor(mediaAbles: MediaAbleResponseDto[]) {
    this.mediaAbles = mediaAbles;
  }

  static fromMediaAbles(mediaAbles: any[] | null | undefined): MediaAblesResponseDto {
    if (!mediaAbles) {
      return new MediaAblesResponseDto([]);
    }
    return new MediaAblesResponseDto(
      mediaAbles.map((mediaAble) =>
        MediaAbleResponseDto.fromMediaAble({
          id: mediaAble.id,
          mediaId: mediaAble.media.id,
          name: mediaAble.media.name,
        }),
      ),
    );
  }
}
