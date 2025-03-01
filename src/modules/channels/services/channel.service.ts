import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IChannelService } from 'src/core/interfaces/services/channel.service.interface';
import { IChannelRepository } from 'src/core/interfaces/repositories/channel.repository.interface';
import { Channel } from '../entities/channel.entity';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { IUserService } from 'src/core/interfaces/services/user.service.interface';

@Injectable()
export class ChannelService implements IChannelService {
  constructor(
    @Inject('IChannelRepository')
    private readonly channelRepository: IChannelRepository,
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

  async create(
    workspaceId: string,
    userId: string,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    const channel = await this.channelRepository.create({
      ...createChannelDto,
      workspaceId,
      createdBy: userId,
    });

    const creator = await this.userService.findById(userId);
    await this.channelRepository.addMember(channel.id, creator);

    return channel;
  }

  async findById(id: string): Promise<Channel> {
    const channel = await this.channelRepository.findById(id);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  async findByWorkspace(workspaceId: string): Promise<Channel[]> {
    return this.channelRepository.findByWorkspace(workspaceId);
  }

  async findUserChannels(
    workspaceId: string,
    userId: string,
  ): Promise<Channel[]> {
    return this.channelRepository.findUserChannels(workspaceId, userId);
  }

  async addMember(channelId: string, userId: string): Promise<void> {
    const channel = await this.findById(channelId);
    const user = await this.userService.findById(userId);
    const members = await this.getMembers(channelId);

    if (members.some((member) => member.id === userId)) {
      throw new ConflictException('User is already a member of this channel');
    }

    await this.channelRepository.addMember(channelId, user);
  }

  async removeMember(channelId: string, userId: string): Promise<void> {
    const channel = await this.findById(channelId);
    if (channel.createdBy === userId) {
      throw new ConflictException('Cannot remove channel creator');
    }

    const members = await this.getMembers(channelId);
    if (!members.some((member) => member.id === userId)) {
      throw new NotFoundException('User is not a member of this channel');
    }

    await this.channelRepository.removeMember(channelId, userId);
  }

  async getMembers(channelId: string): Promise<User[]> {
    return this.channelRepository.getMembers(channelId);
  }

  async update(
    channelId: string,
    data: Partial<CreateChannelDto>,
  ): Promise<Channel> {
    await this.findById(channelId);
    return this.channelRepository.update(channelId, data);
  }

  async delete(channelId: string): Promise<void> {
    await this.findById(channelId);
    await this.channelRepository.delete(channelId);
  }
}
