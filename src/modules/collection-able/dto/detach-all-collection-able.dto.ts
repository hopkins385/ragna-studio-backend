import { CollectionAbleDto } from './collection-able.dto';

export class DetachAllCollectionAbleDto {
  readonly model: CollectionAbleDto;

  constructor(model: { id: string; type: string }) {
    this.model = CollectionAbleDto.fromInput(model);
  }

  static fromInput(input: {
    model: { id: string; type: string };
  }): DetachAllCollectionAbleDto {
    return new DetachAllCollectionAbleDto(input.model);
  }
}
