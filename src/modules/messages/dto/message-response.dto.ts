import { Exclude, Expose, Type } from 'class-transformer';
import { Message } from '../entities/message.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Exclude()
export class MessageResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  type: string;

  @Expose()
  channelId: string;

  @Expose()
  userId: string;

  @Expose()
  parentId: string;

  @Expose()
  isThreadParent: boolean;

  @Expose()
  threadMessagesCount: number;

  @Expose()
  lastThreadMessageAt: Date;

  @Expose()
  edited: {
    at: Date;
    by: string;
  };

  @Expose()
  mentions: {
    users: string[];
    channels: string[];
    everyone: boolean;
  };

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  constructor(partial: Partial<Message>) {
    Object.assign(this, partial);

    if (partial.user) {
      this.user = new UserResponseDto(partial.user);
    }
  }
}
