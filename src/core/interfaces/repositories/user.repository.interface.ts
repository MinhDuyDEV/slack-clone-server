import { IBaseRepository } from './base.repository.interface';
import { User } from 'src/modules/users/entities/user.entity';
import { FindOptionsWhere } from 'typeorm';

export interface IUserRepository extends IBaseRepository<User> {
  findOneWithOption(options: {
    where: FindOptionsWhere<User>[];
  }): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<User | null>;
}
