import { IBaseRepository } from './base.repository.interface';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { User } from 'src/modules/users/entities/user.entity';

export interface IChannelRepository extends IBaseRepository<Channel> {
  findByWorkspace(workspaceId: string): Promise<Channel[]>;
  findUserChannels(workspaceId: string, userId: string): Promise<Channel[]>;
  addMember(
    channelId: string,
    memberData: { userId: string; role: string; joinedAt: Date },
  ): Promise<void>;
  removeMember(channelId: string, userId: string): Promise<void>;
  getMembers(channelId: string): Promise<User[]>;
}
