import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  forwardRef,
} from '@nestjs/common';
import { IChannelService } from 'src/core/interfaces/services/channel.service.interface';
import { IChannelRepository } from 'src/core/interfaces/repositories/channel.repository.interface';
import { Channel } from '../entities/channel.entity';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { IUserService } from 'src/core/interfaces/services/user.service.interface';
import { IWorkspaceService } from 'src/core/interfaces/services/workspace.service.interface';

@Injectable()
export class ChannelsService implements IChannelService {
  constructor(
    @Inject('IChannelRepository')
    private readonly channelRepository: IChannelRepository,
    @Inject('IUserService')
    private readonly userService: IUserService,
    @Inject(forwardRef(() => 'IWorkspaceService'))
    private readonly workspaceService?: IWorkspaceService,
  ) {}

  async create(
    workspaceId: string,
    userId: string,
    createChannelDto: CreateChannelDto,
  ): Promise<Channel> {
    if (!createChannelDto.sectionId) {
      const workspace = await this.workspaceService.findById(workspaceId);

      const defaultSection = workspace.sections.find(
        (section) => section.isDefault,
      );

      if (defaultSection) {
        createChannelDto.sectionId = defaultSection.id;
      } else if (workspace.sections && workspace.sections.length > 0) {
        createChannelDto.sectionId = workspace.sections[0].id;
      } else {
        throw new NotFoundException(
          'No sections found in this workspace. Please create a section first.',
        );
      }
    }

    const channel = await this.channelRepository.create({
      ...createChannelDto,
      workspaceId,
      createdBy: userId,
    });

    const creator = await this.userService.findById(userId);
    await this.channelRepository.addMember(channel.id, {
      userId: creator.id,
      role: 'admin',
      joinedAt: new Date(),
    });

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
    // Verify channel exists
    await this.findById(channelId);

    const user = await this.userService.findById(userId);
    const members = await this.getMembers(channelId);

    if (members.some((member) => member.id === userId)) {
      throw new ConflictException('User is already a member of this channel');
    }

    await this.channelRepository.addMember(channelId, {
      userId: user.id,
      role: 'member',
      joinedAt: new Date(),
    });
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
