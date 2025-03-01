import { UserStatus } from 'src/core/enums';
import { User } from 'src/modules/users/entities/user.entity';
import { CreateUserDto } from 'src/modules/users/dto/create.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update.dto';

export interface IUserService {
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findByEmailWithPassword(email: string): Promise<User>;
  create(createUserDto: CreateUserDto): Promise<User>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  updateStatus(id: string, status: UserStatus): Promise<User>;
  updateLastSeen(id: string): Promise<void>;
}
