import { getCollecitonAbleTypeEnumValue } from '@/modules/collection-able/enum/collection-able.enum';

export class CollectionAbleDto {
  readonly id: string;
  readonly type: number;

  constructor(id: string, type: string) {
    this.id = id.toLowerCase();
    this.type = getCollecitonAbleTypeEnumValue(type);
  }

  static fromInput(input: { id: string; type: string }): CollectionAbleDto {
    return new CollectionAbleDto(input.id, input.type);
  }
}

export class CreateCollectionDto {
  readonly teamId: string;
  readonly name: string;
  readonly description: string;

  constructor(teamId: string, name: string, description: string) {
    this.teamId = teamId;
    this.name = name;
    this.description = description;
  }

  static fromInput(input: {
    teamId: string;
    name: string;
    description: string;
  }): CreateCollectionDto {
    return new CreateCollectionDto(input.teamId, input.name, input.description);
  }
}
