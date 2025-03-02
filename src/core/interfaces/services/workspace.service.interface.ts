import { Workspace } from 'src/modules/workspaces/entities/workspace.entity';
import { CreateWorkspaceDto } from 'src/modules/workspaces/dto/create-workspace.dto';
import { WorkspaceMember } from 'src/modules/workspaces/entities/workspace-member.entity';
import { WorkspaceRole } from 'src/core/enums';
import { UpdateWorkspaceMemberProfileDto } from 'src/modules/workspaces/dto/update-workspace-member-profile.dto';
import { CreateInviteDto } from 'src/modules/workspaces/dto/create-invite.dto';
import { WorkspaceInvite } from 'src/modules/workspaces/entities/workspace-invite.entity';

export interface IWorkspaceService {
  create(
    userId: string,
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<Workspace>;
  findById(id: string, userId?: string): Promise<Workspace>;
  findBySlug(slug: string, userId?: string): Promise<Workspace>;
  findUserWorkspaces(
    userId: string,
    includeDetails?: boolean,
  ): Promise<Workspace[]>;

  // Member management
  addMember(
    workspaceId: string,
    userId: string,
    role?: WorkspaceRole,
  ): Promise<WorkspaceMember>;
  updateMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMember>;
  updateMemberDisplayName(
    workspaceId: string,
    userId: string,
    displayName: string,
  ): Promise<WorkspaceMember>;
  updateMemberProfile(
    workspaceId: string,
    userId: string,
    profileData: UpdateWorkspaceMemberProfileDto,
  ): Promise<WorkspaceMember>;
  removeMember(workspaceId: string, userId: string): Promise<void>;
  getMember(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null>;

  // Settings
  updateSettings(
    workspaceId: string,
    settings: {
      allowInvites?: boolean;
      allowPublicChannels?: boolean;
      allowDirectMessages?: boolean;
      defaultChannelId?: string;
    },
  ): Promise<Workspace>;

  // Check membership
  isUserMemberOfWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<boolean>;

  // Invites
  createInvite(
    workspaceId: string,
    userId: string,
    createInviteDto: CreateInviteDto,
  ): Promise<WorkspaceInvite>;
  getWorkspaceInvites(workspaceId: string): Promise<WorkspaceInvite[]>;
  deleteInvite(workspaceId: string, inviteId: string): Promise<void>;
  joinWorkspaceByCode(
    userId: string,
    inviteCode: string,
  ): Promise<WorkspaceMember>;
}
