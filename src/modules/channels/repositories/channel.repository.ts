import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IChannelRepository } from 'src/core/interfaces/repositories/channel.repository.interface';
import { Channel } from '../entities/channel.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { BaseRepository } from 'src/core/repositories/base.repository';

@Injectable()
export class ChannelsRepository
  extends BaseRepository<Channel>
  implements IChannelRepository
{
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) {
    super(channelRepository);
  }

  async findByWorkspace(workspaceId: string): Promise<Channel[]> {
    return this.channelRepository.find({
      where: { workspaceId },
      relations: ['members'],
    });
  }

  async findUserChannels(
    workspaceId: string,
    userId: string,
  ): Promise<Channel[]> {
    return this.channelRepository
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.members', 'member')
      .where('channel.workspaceId = :workspaceId', { workspaceId })
      .andWhere('(channel.isPrivate = false OR member.id = :userId)', {
        userId,
      })
      .getMany();
  }

  async addMember(
    channelId: string,
    memberData: { userId: string; role: string; joinedAt: Date },
  ): Promise<void> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['members'],
    });

    if (channel) {
      const userRepository = this.channelRepository.manager.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: memberData.userId },
      });

      if (user) {
        if (!channel.members) {
          channel.members = [];
        }

        const isMember = channel.members.some(
          (member) => member.id === user.id,
        );
        if (!isMember) {
          channel.members.push(user);
          await this.channelRepository.save(channel);
        }

        await this.channelRepository.manager.query(
          `INSERT INTO channel_members_roles (channel_id, user_id, role, joined_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (channel_id, user_id) DO UPDATE
           SET role = $3, joined_at = $4`,
          [channelId, memberData.userId, memberData.role, memberData.joinedAt],
        );
      }
    }
  }

  async removeMember(channelId: string, userId: string): Promise<void> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['members'],
    });

    if (channel) {
      channel.members = channel.members.filter(
        (member) => member.id !== userId,
      );
      await this.channelRepository.save(channel);
    }
  }

  async getMembers(channelId: string): Promise<User[]> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
      relations: ['members'],
    });
    return channel ? channel.members : [];
  }
}
