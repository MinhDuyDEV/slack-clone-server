import { Exclude, Expose } from 'class-transformer';
import { User } from '../entities/user.entity';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  fullName: string;

  @Expose()
  displayName: string;

  @Expose()
  email: string;
  @Expose()
  avatar: string;

  @Expose()
  isOnline: boolean;

  @Expose()
  lastSeen: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  static fromEntity(user: User): UserResponseDto {
    return new UserResponseDto(user);
  }
}
