import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IUserRepository } from 'src/core/interfaces/repositories/user.repository.interface';
import { IUserService } from 'src/core/interfaces/services/user.service.interface';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserDto } from './dto/update.dto';
import { UserStatus } from 'src/core/enums';

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmailWithPassword(email: string): Promise<User> {
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOneWithOption({
      where: [
        { email: createUserDto.email.toLowerCase() },
        { username: createUserDto.username.toLowerCase() },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    return this.userRepository.create({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      username: createUserDto.username.toLowerCase(),
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findById(id);

    if (updateUserDto.email || updateUserDto.username) {
      const existingUser = await this.userRepository.findOneWithOption({
        where: [
          { email: updateUserDto.email?.toLowerCase() },
          { username: updateUserDto.username?.toLowerCase() },
        ],
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email or username already exists');
      }
    }

    return this.userRepository.update(id, updateUserDto);
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    await this.findById(id);
    return this.userRepository.update(id, { status });
  }

  async updateLastSeen(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastSeen: new Date(),
      isOnline: false,
    });
  }
}
