import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IWorkspaceService } from 'src/core/interfaces/services/workspace.service.interface';
import { IWorkspaceRepository } from 'src/core/interfaces/repositories/workspace.repository.interface';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { WorkspaceRole } from 'src/core/enums';
import { IWorkspaceMember } from 'src/core/interfaces/entities/workspace.interface';
import { UpdateWorkspaceMemberProfileDto } from '../dto/update-workspace-member-profile.dto';

@Injectable()
export class WorkspacesService implements IWorkspaceService {
  constructor(
    @Inject('IWorkspaceRepository')
    private readonly workspaceRepository: IWorkspaceRepository,
  ) {}

  async create(
    userId: string,
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<Workspace> {
    const existingWorkspace = await this.workspaceRepository.findBySlug(
      createWorkspaceDto.slug,
    );
    if (existingWorkspace) {
      throw new ConflictException('Workspace with this slug already exists');
    }

    const workspace = await this.workspaceRepository.create({
      ...createWorkspaceDto,
      ownerId: userId,
      settings: {
        allowInvites: true,
        allowPublicChannels: true,
        allowDirectMessages: true,
      },
    });

    await this.workspaceRepository.addMember(workspace.id, {
      userId,
      role: WorkspaceRole.OWNER,
      status: 'active',
      joinedAt: new Date(),
    });

    return workspace;
  }

  async findById(id: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async findBySlug(slug: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findBySlug(slug);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async findUserWorkspaces(userId: string): Promise<Workspace[]> {
    return this.workspaceRepository.findUserWorkspaces(userId);
  }

  async addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole = WorkspaceRole.MEMBER,
  ): Promise<WorkspaceMember> {
    // Verify workspace exists
    await this.findById(workspaceId);

    const existingMember = await this.workspaceRepository.findMember(
      workspaceId,
      userId,
    );

    if (existingMember) {
      throw new ConflictException('User is already a member of this workspace');
    }

    const memberData: Partial<IWorkspaceMember> = {
      userId,
      role,
      status: 'invited',
      joinedAt: new Date(),
    };

    const newMember = await this.workspaceRepository.addMember(
      workspaceId,
      memberData,
    );
    return newMember as unknown as WorkspaceMember;
  }

  async updateMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMember> {
    const workspace = await this.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const member = await this.workspaceRepository.findMember(
      workspaceId,
      userId,
    );
    if (!member) {
      throw new NotFoundException('Member not found in workspace');
    }

    const updatedMember = await this.workspaceRepository.updateMember(
      workspaceId,
      userId,
      { role },
    );
    return updatedMember as unknown as WorkspaceMember;
  }

  async updateMemberDisplayName(
    workspaceId: string,
    userId: string,
    displayName: string,
  ): Promise<WorkspaceMember> {
    const workspace = await this.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const member = await this.workspaceRepository.findMember(
      workspaceId,
      userId,
    );
    if (!member) {
      throw new NotFoundException('Member not found in workspace');
    }

    const updatedMember = await this.workspaceRepository.updateMember(
      workspaceId,
      userId,
      { displayName },
    );
    return updatedMember as unknown as WorkspaceMember;
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const workspace = await this.findById(workspaceId);
    if (workspace.ownerId === userId) {
      throw new ConflictException('Cannot remove workspace owner');
    }

    const member = await this.workspaceRepository.findMember(
      workspaceId,
      userId,
    );
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.workspaceRepository.removeMember(workspaceId, userId);
  }

  async getMember(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null> {
    const member = await this.workspaceRepository.findMember(
      workspaceId,
      userId,
    );
    return member as unknown as WorkspaceMember | null;
  }

  async updateSettings(
    workspaceId: string,
    settings: {
      allowInvites?: boolean;
      allowPublicChannels?: boolean;
      allowDirectMessages?: boolean;
      defaultChannelId?: string;
    },
  ): Promise<Workspace> {
    const workspace = await this.findById(workspaceId);
    return this.workspaceRepository.update(workspaceId, {
      settings: { ...workspace.settings, ...settings },
    });
  }

  async updateMemberProfile(
    workspaceId: string,
    userId: string,
    profileData: UpdateWorkspaceMemberProfileDto,
  ): Promise<WorkspaceMember> {
    const workspace = await this.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const member = await this.workspaceRepository.findMember(
      workspaceId,
      userId,
    );
    if (!member) {
      throw new NotFoundException('Member not found in workspace');
    }

    const updatedMember = await this.workspaceRepository.updateMember(
      workspaceId,
      userId,
      profileData,
    );
    return updatedMember as unknown as WorkspaceMember;
  }
}
