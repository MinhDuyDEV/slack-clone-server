import { UserStatus } from 'src/core/enums';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  displayName?: string;
  avatar?: string;
  status: UserStatus;
  isEmailVerified: boolean;
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.username = user.username;
    this.fullName = user.fullName;
    this.displayName = user.displayName;
    this.avatar = user.avatar;
    this.status = user.status;
    this.isEmailVerified = user.isEmailVerified;
    this.createdAt = user.createdAt;
  }

  static fromEntity(user: User): UserResponseDto {
    return new UserResponseDto(user);
  }
}
