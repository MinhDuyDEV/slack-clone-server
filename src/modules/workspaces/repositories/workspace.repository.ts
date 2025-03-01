import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IWorkspaceRepository } from 'src/core/interfaces/repositories/workspace.repository.interface';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { BaseRepository } from 'src/core/repositories/base.repository';

@Injectable()
export class WorkspaceRepository
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
    return this.workspaceRepository.findOne({
      where: { slug },
      relations: ['members', 'channels'],
    });
  }

  async findUserWorkspaces(userId: string): Promise<Workspace[]> {
    const members = await this.memberRepository.find({
      where: { userId },
      relations: ['workspace'],
    });
    return members.map((member) => member.workspace);
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
}
