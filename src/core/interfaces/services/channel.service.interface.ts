import { Channel } from 'src/modules/channels/entities/channel.entity';
import { CreateChannelDto } from 'src/modules/channels/dto/create-channel.dto';
import { User } from 'src/modules/users/entities/user.entity';

export interface IChannelService {
  create(
    workspaceId: string,
    userId: string,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel>;

  findById(id: string): Promise<Channel>;
  findByWorkspace(workspaceId: string): Promise<Channel[]>;
  findUserChannels(workspaceId: string, userId: string): Promise<Channel[]>;

  addMember(channelId: string, userId: string): Promise<void>;
  removeMember(channelId: string, userId: string): Promise<void>;
  getMembers(channelId: string): Promise<User[]>;

  update(channelId: string, data: Partial<CreateChannelDto>): Promise<Channel>;

  delete(channelId: string): Promise<void>;
}
