import { CollectionAbleDto } from './collection-able.dto';

export class DetachCollectionAbleDto {
  readonly model: CollectionAbleDto;
  readonly collectionId: string;

  constructor(model: { id: string; type: string }, collectionId: string) {
    this.model = CollectionAbleDto.fromInput(model);
    this.collectionId = collectionId.toLowerCase();
  }

  static fromInput(input: {
    model: { id: string; type: string };
    collectionId: string;
  }): DetachCollectionAbleDto {
    return new DetachCollectionAbleDto(input.model, input.collectionId);
  }
}
