import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IWorkspaceRepository } from 'src/core/interfaces/repositories/workspace.repository.interface';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { BaseRepository } from 'src/core/repositories/base.repository';
import { In } from 'typeorm';
import { Section } from 'src/modules/sections/entities/section.entity';
import { Channel } from 'src/modules/channels/entities/channel.entity';

@Injectable()
export class WorkspacesRepository
  extends BaseRepository<Workspace>
  implements IWorkspaceRepository
{
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly memberRepository: Repository<WorkspaceMember>,
  ) {
    super(workspaceRepository);
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    const workspace = await this.workspaceRepository.findOne({
      where: { slug },
      relations: ['members'],
    });

    if (!workspace) {
      return null;
    }

    const [sections, channels] = await Promise.all([
      this.workspaceRepository.manager.getRepository(Section).find({
        where: { workspaceId: workspace.id },
      }),
      this.workspaceRepository.manager.getRepository(Channel).find({
        where: { workspaceId: workspace.id },
      }),
    ]);

    workspace.sections = sections;
    workspace.channels = channels;

    return workspace;
  }

  async findUserWorkspaces(userId: string): Promise<Workspace[]> {
    const members = await this.memberRepository.find({
      where: { userId },
      relations: ['workspace'],
    });

    const workspaceIds = members.map((member) => member.workspace.id);
    if (workspaceIds.length === 0) {
      return [];
    }

    const workspaces = await this.workspaceRepository.find({
      where: { id: In(workspaceIds) },
      relations: ['members'],
    });

    const [allSections, allChannels] = await Promise.all([
      this.workspaceRepository.manager.getRepository(Section).find({
        where: { workspaceId: In(workspaceIds) },
      }),
      this.workspaceRepository.manager.getRepository(Channel).find({
        where: { workspaceId: In(workspaceIds) },
      }),
    ]);

    const sectionsByWorkspace = {};
    const channelsByWorkspace = {};

    allSections.forEach((section) => {
      if (!sectionsByWorkspace[section.workspaceId]) {
        sectionsByWorkspace[section.workspaceId] = [];
      }
      sectionsByWorkspace[section.workspaceId].push(section);
    });

    allChannels.forEach((channel) => {
      if (!channelsByWorkspace[channel.workspaceId]) {
        channelsByWorkspace[channel.workspaceId] = [];
      }
      channelsByWorkspace[channel.workspaceId].push(channel);
    });

    workspaces.forEach((workspace) => {
      workspace.sections = sectionsByWorkspace[workspace.id] || [];
      workspace.channels = channelsByWorkspace[workspace.id] || [];
    });

    return workspaces;
  }

  async findMember(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null> {
    return this.memberRepository.findOne({
      where: { workspaceId, userId },
    });
  }

  async addMember(
    workspaceId: string,
    member: Partial<WorkspaceMember>,
  ): Promise<WorkspaceMember> {
    const newMember = this.memberRepository.create({
      workspaceId,
      ...member,
    });
    return this.memberRepository.save(newMember);
  }

  async updateMember(
    workspaceId: string,
    userId: string,
    data: Partial<WorkspaceMember>,
  ): Promise<WorkspaceMember> {
    await this.memberRepository.update({ workspaceId, userId }, data);
    return this.findMember(workspaceId, userId);
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await this.memberRepository.delete({ workspaceId, userId });
  }

  async findById(id: string): Promise<Workspace | null> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: ['members'],
    });

    if (!workspace) {
      return null;
    }

    // Lấy sections và channels song song
    const [sections, channels] = await Promise.all([
      this.workspaceRepository.manager.getRepository(Section).find({
        where: { workspaceId: workspace.id },
      }),
      this.workspaceRepository.manager.getRepository(Channel).find({
        where: { workspaceId: workspace.id },
      }),
    ]);

    // Gán sections và channels vào workspace
    workspace.sections = sections;
    workspace.channels = channels;

    return workspace;
  }
}
