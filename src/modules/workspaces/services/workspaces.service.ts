import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  forwardRef,
} from '@nestjs/common';
import { IWorkspaceService } from 'src/core/interfaces/services/workspace.service.interface';
import { IWorkspaceRepository } from 'src/core/interfaces/repositories/workspace.repository.interface';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { WorkspaceRole } from 'src/core/enums';
import { IWorkspaceMember } from 'src/core/interfaces/entities/workspace.interface';
import { UpdateWorkspaceMemberProfileDto } from '../dto/update-workspace-member-profile.dto';
import { CreateInviteDto } from '../dto/create-invite.dto';
import { WorkspaceInvite } from '../entities/workspace-invite.entity';
import { WorkspaceInviteRepository } from '../repositories/workspace-invite.repository';
import { randomBytes } from 'crypto';
import { add } from 'date-fns';
import { ISectionService } from 'src/core/interfaces/services/section.service.interface';
import { IChannelService } from 'src/core/interfaces/services/channel.service.interface';

@Injectable()
export class WorkspacesService implements IWorkspaceService {
  constructor(
    @Inject('IWorkspaceRepository')
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly inviteRepository: WorkspaceInviteRepository,
    @Inject(forwardRef(() => 'ISectionService'))
    private readonly sectionService: ISectionService,
    @Inject(forwardRef(() => 'IChannelService'))
    private readonly channelService: IChannelService,
  ) {}

  async create(
    userId: string,
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<Workspace> {
    if (!createWorkspaceDto.slug) {
      createWorkspaceDto.slug = this.generateSlug(createWorkspaceDto.name);
    }

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
      invitedBy: userId,
      joinedAt: new Date(),
    });

    const generalSection = await this.sectionService.create(
      {
        name: 'Channels',
        workspaceId: workspace.id,
        isDefault: true,
        order: 0,
      },
      userId,
    );

    const userDMSection = await this.sectionService.create(
      {
        name: 'Direct Messages',
        workspaceId: workspace.id,
        isDirectMessages: true,
        isDefault: false,
        order: 1,
        userId: userId,
      },
      userId,
    );

    const generalChannel = await this.channelService.create(
      workspace.id,
      userId,
      {
        name: 'general',
        description: 'General discussions',
        sectionId: generalSection.id,
        isDefault: true,
        isPrivate: false,
      },
    );

    await this.workspaceRepository.update(workspace.id, {
      settings: {
        ...workspace.settings,
        defaultChannelId: generalChannel.id,
        defaultSectionId: generalSection.id,
        ownerDirectMessageSectionId: userDMSection.id,
      },
    });

    const [completeWorkspace, sections, channels] = await Promise.all([
      this.workspaceRepository.findById(workspace.id),
      this.sectionService.findAll(workspace.id),
      this.channelService.findByWorkspace(workspace.id),
    ]);

    completeWorkspace.sections = sections;
    completeWorkspace.channels = channels;

    return completeWorkspace;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
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

  async findUserWorkspaces(
    userId: string,
    includeDetails: boolean = false,
  ): Promise<Workspace[]> {
    return this.workspaceRepository.findUserWorkspaces(userId, includeDetails);
  }

  async addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole = WorkspaceRole.MEMBER,
  ): Promise<WorkspaceMember> {
    const workspace = await this.findById(workspaceId);

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
      invitedBy: userId,
      status: 'invited',
      joinedAt: new Date(),
    };

    const newMember = await this.workspaceRepository.addMember(
      workspaceId,
      memberData,
    );

    // Tạo section Direct Messages riêng cho thành viên mới
    await this.sectionService.create(
      {
        name: 'Direct Messages',
        workspaceId: workspace.id,
        isDirectMessages: true,
        isDefault: false,
        order: 1, // Có thể cần điều chỉnh order dựa trên số lượng section hiện có
        userId: userId, // Liên kết section với user
      },
      userId,
    );

    return newMember as WorkspaceMember;
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
    return updatedMember as WorkspaceMember;
  }

  async isUserMemberOfWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    const member = await this.workspaceRepository.findMember(
      workspaceId,
      userId,
    );
    return !!member;
  }

  async createInvite(
    workspaceId: string,
    userId: string,
    createInviteDto: CreateInviteDto,
  ): Promise<WorkspaceInvite> {
    const workspace = await this.findById(workspaceId);

    const member = await this.workspaceRepository.findMember(
      workspaceId,
      userId,
    );
    if (!member) {
      throw new UnauthorizedException('You are not a member of this workspace');
    }

    if (
      member.role !== WorkspaceRole.OWNER &&
      member.role !== WorkspaceRole.ADMIN
    ) {
      throw new UnauthorizedException(
        'You do not have permission to create invites',
      );
    }

    if (!workspace.settings?.allowInvites) {
      throw new BadRequestException('Invites are disabled for this workspace');
    }

    const code = this.generateInviteCode();

    let expiresAt: Date;
    if (createInviteDto.expiresIn) {
      const duration = createInviteDto.expiresIn;
      if (duration.endsWith('d')) {
        const days = parseInt(duration.slice(0, -1));
        expiresAt = add(new Date(), { days });
      } else if (duration.endsWith('h')) {
        const hours = parseInt(duration.slice(0, -1));
        expiresAt = add(new Date(), { hours });
      } else {
        expiresAt = add(new Date(), { days: 7 });
      }
    } else {
      expiresAt = add(new Date(), { days: 7 });
    }

    const inviteData = {
      code,
      workspaceId,
      createdBy: userId,
      role: createInviteDto.role || WorkspaceRole.MEMBER,
      multiUse: createInviteDto.multiUse || false,
      expiresAt,
    };

    return this.inviteRepository.create(inviteData);
  }

  async joinWorkspaceByCode(
    userId: string,
    inviteCode: string,
  ): Promise<WorkspaceMember> {
    const invite = await this.inviteRepository.findActiveByCode(inviteCode);
    if (!invite) {
      throw new NotFoundException('Invalid or expired invite code');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite code has expired');
    }

    const existingMember = await this.workspaceRepository.findMember(
      invite.workspaceId,
      userId,
    );
    if (existingMember) {
      throw new ConflictException('You are already a member of this workspace');
    }

    const memberData: Partial<IWorkspaceMember> = {
      userId,
      role: invite.role,
      status: 'active',
      joinedAt: new Date(),
      invitedBy: invite.createdBy,
    };

    const member = await this.workspaceRepository.addMember(
      invite.workspaceId,
      memberData,
    );

    await this.sectionService.create(
      {
        name: 'Direct Messages',
        workspaceId: invite.workspaceId,
        isDirectMessages: true,
        isDefault: false,
        order: 1,
        userId: userId,
      },
      userId,
    );

    if (!invite.multiUse) {
      await this.inviteRepository.softDelete(invite.id);
    } else {
      await this.inviteRepository.incrementUsageCount(invite.id);
    }

    return member as WorkspaceMember;
  }

  async getWorkspaceInvites(workspaceId: string): Promise<WorkspaceInvite[]> {
    await this.findById(workspaceId);

    return this.inviteRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteInvite(workspaceId: string, inviteId: string): Promise<void> {
    await this.findById(workspaceId);

    const invite = await this.inviteRepository.findById(inviteId);
    if (!invite || invite.workspaceId !== workspaceId) {
      throw new NotFoundException('Invite not found');
    }

    await this.inviteRepository.softDelete(inviteId);
  }

  private generateInviteCode(): string {
    return randomBytes(5).toString('hex');
  }
}
