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
import { ChannelType } from 'src/core/enums';
import { IUserService } from 'src/core/interfaces/services/user.service.interface';

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
    @Inject(forwardRef(() => 'IUserService'))
    private readonly userService: IUserService,
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

    // Tạo workspace
    const workspace = await this.workspaceRepository.create({
      ...createWorkspaceDto,
      ownerId: userId,
      settings: {
        allowInvites: true,
        allowPublicChannels: true,
        allowDirectMessages: true,
      },
    });

    // Thêm người dùng làm thành viên
    await this.workspaceRepository.addMember(workspace.id, {
      userId,
      role: WorkspaceRole.OWNER,
      status: 'active',
      invitedBy: userId,
      joinedAt: new Date(),
    });

    // Tạo section chung
    const generalSection = await this.sectionService.create(
      {
        name: 'Channels',
        workspaceId: workspace.id,
        isDefault: true,
        order: 0,
      },
      userId,
    );

    // Tạo section Direct Messages cho người dùng
    const userDMSection = await this.sectionService.create(
      {
        name: 'Direct Messages',
        workspaceId: workspace.id,
        isDirectMessages: true,
        isDefault: false,
        order: 10000,
        userId: userId,
      },
      userId,
    );

    // Tạo kênh general
    const generalChannel = await this.channelService.create(
      workspace.id,
      userId,
      {
        name: 'general',
        description: 'General discussions',
        sectionId: generalSection.id,
        isDefault: true,
        type: ChannelType.PUBLIC,
      },
    );

    // Tạo kênh Direct Message với chính mình
    await this.channelService.createDirectMessageChannel(
      workspace.id,
      userId,
      [userId],
      userDMSection.id,
    );

    // Cập nhật cài đặt workspace
    await this.workspaceRepository.update(workspace.id, {
      settings: {
        ...workspace.settings,
        defaultChannelId: generalChannel.id,
        defaultSectionId: generalSection.id,
        ownerDirectMessageSectionId: userDMSection.id,
      },
    });

    // Lấy dữ liệu đầy đủ của workspace
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

  async findById(id: string, userId?: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Nếu có userId, lọc các kênh private mà người dùng không phải là thành viên
    if (userId && workspace.channels && workspace.channels.length > 0) {
      // Lấy danh sách kênh mà người dùng là thành viên
      const userChannels = await this.channelService.findUserChannels(
        id,
        userId,
      );
      const userChannelIds = userChannels.map((channel) => channel.id);

      // Lọc các kênh: giữ lại kênh PUBLIC hoặc kênh PRIVATE/DIRECT mà người dùng là thành viên
      workspace.channels = workspace.channels.filter(
        (channel) =>
          channel.type === ChannelType.PUBLIC ||
          userChannelIds.includes(channel.id),
      );
    }

    return workspace;
  }

  async findBySlug(slug: string, userId?: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findBySlug(slug);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Nếu có userId, lọc các kênh private mà người dùng không phải là thành viên
    if (userId && workspace.channels && workspace.channels.length > 0) {
      // Lấy danh sách kênh mà người dùng là thành viên
      const userChannels = await this.channelService.findUserChannels(
        workspace.id,
        userId,
      );
      const userChannelIds = userChannels.map((channel) => channel.id);

      // Lọc các kênh: giữ lại kênh PUBLIC hoặc kênh PRIVATE/DIRECT mà người dùng là thành viên
      workspace.channels = workspace.channels.filter(
        (channel) =>
          channel.type === ChannelType.PUBLIC ||
          userChannelIds.includes(channel.id),
      );
    }

    return workspace;
  }

  async findUserWorkspaces(
    userId: string,
    includeDetails: boolean = false,
  ): Promise<Workspace[]> {
    const workspaces = await this.workspaceRepository.findUserWorkspaces(
      userId,
      includeDetails,
    );

    // Nếu includeDetails = true, lọc các kênh private mà người dùng không phải là thành viên
    if (includeDetails && workspaces.length > 0) {
      for (const workspace of workspaces) {
        if (workspace.channels && workspace.channels.length > 0) {
          // Lấy danh sách kênh mà người dùng là thành viên
          const userChannels = await this.channelService.findUserChannels(
            workspace.id,
            userId,
          );
          const userChannelIds = userChannels.map((channel) => channel.id);

          // Lọc các kênh: giữ lại kênh PUBLIC hoặc kênh PRIVATE/DIRECT mà người dùng là thành viên
          workspace.channels = workspace.channels.filter(
            (channel) =>
              channel.type === ChannelType.PUBLIC ||
              userChannelIds.includes(channel.id),
          );
        }
      }
    }

    return workspaces;
  }

  async addMember(
    workspaceId: string,
    email: string,
    role: WorkspaceRole = WorkspaceRole.MEMBER,
    inviterId?: string,
  ): Promise<WorkspaceMember> {
    if (inviterId) {
      const inviter = await this.userService.findById(inviterId);
      if (!inviter) {
        throw new NotFoundException('Inviter not found');
      }
    }
    const workspace = await this.findById(workspaceId);
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingMember = await this.workspaceRepository.findMember(
      workspaceId,
      user.id,
    );

    if (existingMember) {
      throw new ConflictException('User is already a member of this workspace');
    }

    // Kiểm tra xem người dùng đã có section Direct Messages trong workspace này chưa
    const userDMSection = workspace.sections.find(
      (section) => section.isDirectMessages && section.userId === user.id,
    );

    const memberData: Partial<IWorkspaceMember> = {
      userId: user.id,
      role,
      invitedBy: inviterId,
      status: 'invited',
      joinedAt: new Date(),
    };

    // Thêm thành viên mới
    const newMember = await this.workspaceRepository.addMember(
      workspaceId,
      memberData,
    );

    let dmSectionId: string;

    // Nếu người dùng chưa có section Direct Messages, tạo mới
    if (!userDMSection) {
      const userDMSection = await this.sectionService.create(
        {
          name: 'Direct Messages',
          workspaceId: workspace.id,
          isDirectMessages: true,
          isDefault: false,
          order: 10000,
          userId: user.id,
        },
        user.id,
      );
      dmSectionId = userDMSection.id;
    } else {
      dmSectionId = userDMSection.id;
    }

    // Tạo kênh Direct Message với chính người dùng (self DM)
    await this.channelService.createDirectMessageChannel(
      workspace.id,
      user.id,
      [user.id], // Thêm chính người dùng vào danh sách targetUserIds
      dmSectionId,
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

    // Lấy thông tin workspace
    const workspace = await this.findById(invite.workspaceId);

    // Kiểm tra xem người dùng đã có section Direct Messages trong workspace này chưa
    const userDMSection = workspace.sections.find(
      (section) => section.isDirectMessages && section.userId === userId,
    );

    const memberData: Partial<IWorkspaceMember> = {
      userId,
      role: invite.role,
      status: 'active',
      joinedAt: new Date(),
      invitedBy: invite.createdBy,
    };

    // Thêm thành viên mới
    const member = await this.workspaceRepository.addMember(
      invite.workspaceId,
      memberData,
    );

    let dmSectionId: string;

    // Nếu người dùng chưa có section Direct Messages, tạo mới
    if (!userDMSection) {
      const newDMSection = await this.sectionService.create(
        {
          name: 'Direct Messages',
          workspaceId: invite.workspaceId,
          isDirectMessages: true,
          isDefault: false,
          order: 10000, // Sử dụng khoảng cách 10000 như đã cập nhật
          userId: userId,
        },
        userId,
      );
      dmSectionId = newDMSection.id;
    } else {
      dmSectionId = userDMSection.id;
    }

    // Tạo kênh Direct Message với chính người dùng (self DM)
    await this.channelService.createDirectMessageChannel(
      invite.workspaceId,
      userId,
      [userId],
      dmSectionId,
    );

    // Cập nhật trạng thái mã mời
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
