import { IBaseRepository } from './base.repository.interface';
import { IUser } from '../entities/user.interface';
import { FindOptionsWhere } from 'typeorm';

export interface IUserRepository extends IBaseRepository<IUser> {
  findOneWithOption(options: {
    where: FindOptionsWhere<IUser>[];
  }): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailWithPassword(email: string): Promise<IUser | null>;
}
