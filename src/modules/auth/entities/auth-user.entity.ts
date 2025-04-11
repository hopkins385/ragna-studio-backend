export class AuthUserEntity {
  readonly id: string;

  constructor({ id }: { id: string }) {
    this.id = id;
  }

  static fromInput(input: { id: string }): AuthUserEntity {
    return new AuthUserEntity(input);
  }
}
