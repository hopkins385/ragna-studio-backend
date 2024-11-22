import { CollectionAbleDto } from './collection-able.dto';

export class AttachCollectionAbleDto {
  readonly model: CollectionAbleDto;
  readonly collectionId: string;

  constructor(model: { id: string; type: string }, collectionId: string) {
    this.model = CollectionAbleDto.fromInput(model);
    this.collectionId = collectionId.toLowerCase();
  }

  static fromInput(input: {
    model: { id: string; type: string };
    collectionId: string;
  }): AttachCollectionAbleDto {
    return new AttachCollectionAbleDto(input.model, input.collectionId);
  }
}
