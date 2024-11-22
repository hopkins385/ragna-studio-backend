// repository.types.ts
export interface IEntity {
  id: string | number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface IRepository<T extends IEntity> {
  // Create
  create(item: Omit<T, 'id'>): Promise<T>;

  // Read
  findById(id: string): Promise<T | Partial<T> | null>;
  findAll(
    filter?: Partial<T>,
    options?: PaginationOptions,
  ): Promise<T[] | Array<Partial<T>>>;

  // Update
  update(id: string, data: Partial<T>): Promise<T | Partial<T> | null>;

  // Delete
  delete(id: string, filter?: Partial<T>): Promise<boolean>;
  softDelete(id: string, filter?: Partial<T>): Promise<boolean>;

  // Utility methods
  findMany(filter: Partial<T>): Promise<T[] | any>;
  exists(id: string | number): Promise<boolean>;
}

export abstract class BaseRepository<T extends IEntity>
  implements IRepository<T>
{
  // Abstract CRUD methods
  abstract create(data: Omit<T, 'id'>): Promise<T>;
  abstract findById(id: string): Promise<T | Partial<T> | null>;
  abstract findAll(
    filter?: Partial<T>,
    options?: PaginationOptions,
  ): Promise<T[] | Array<Partial<T>>>;
  abstract findMany(filter: Partial<T>): Promise<T[]>;
  abstract update(id: string, data: Partial<T>): Promise<T | Partial<T> | null>;
  abstract delete(id: string, filter?: Partial<T>): Promise<boolean>;
  abstract softDelete(id: string, filter?: Partial<T>): Promise<boolean>;

  async exists(id: string): Promise<boolean> {
    const item = await this.findById(id.toLowerCase());
    return item !== null;
  }

  // Protected helper method
  protected validateId(id: string): void {
    if (!id) throw new Error('Invalid ID provided');
  }
}
