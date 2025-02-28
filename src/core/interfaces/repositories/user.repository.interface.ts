import { IBaseRepository } from './base.repository.interface';
import { IUser } from '../entities/user.interface';

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByEmailWithPassword(email: string): Promise<IUser | null>;
}
