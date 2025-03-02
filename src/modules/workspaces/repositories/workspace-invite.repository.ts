import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { WorkspaceInvite } from '../entities/workspace-invite.entity';
import { BaseRepository } from 'src/core/repositories/base.repository';

@Injectable()
export class WorkspaceInviteRepository extends BaseRepository<WorkspaceInvite> {
  constructor(
    @InjectRepository(WorkspaceInvite)
    private readonly inviteRepository: Repository<WorkspaceInvite>,
  ) {
    super(inviteRepository);
  }

  async findByCode(code: string): Promise<WorkspaceInvite | null> {
    return this.inviteRepository.findOne({
      where: { code },
      relations: ['workspace'],
    });
  }

  async findActiveByCode(code: string): Promise<WorkspaceInvite | null> {
    return this.inviteRepository.findOne({
      where: {
        code,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['workspace'],
    });
  }

  async incrementUsageCount(id: string): Promise<void> {
    await this.inviteRepository.increment({ id }, 'usageCount', 1);
  }

  async save(invite: WorkspaceInvite): Promise<WorkspaceInvite> {
    return this.inviteRepository.save(invite);
  }

  async softDelete(id: string): Promise<void> {
    await this.inviteRepository.softDelete(id);
  }

  async find(options?: any): Promise<WorkspaceInvite[]> {
    return this.inviteRepository.find(options);
  }
}
