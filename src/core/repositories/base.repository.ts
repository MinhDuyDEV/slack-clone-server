import { Repository } from 'typeorm';
import { IBaseRepository } from '../interfaces/repositories/base.repository.interface';

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  constructor(private readonly repository: Repository<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as any);
    return this.repository.save(entity) as Promise<T>;
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return this.repository.findOne({ where: filter as any });
  }

  async findAll(filter?: Partial<T>): Promise<T[]> {
    return this.repository.find({ where: filter as any });
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    await this.repository.update(id, data as any);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Entity not found after update');
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
