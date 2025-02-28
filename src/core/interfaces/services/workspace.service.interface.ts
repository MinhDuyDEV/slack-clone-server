import { Workspace } from 'src/modules/workspaces/entities/workspace.entity';
import { CreateWorkspaceDto } from 'src/modules/workspaces/dto/create-workspace.dto';
import { WorkspaceMember } from 'src/modules/workspaces/entities/workspace-member.entity';
import { WorkspaceRole } from 'src/core/enums';
import { UpdateWorkspaceMemberProfileDto } from 'src/modules/workspaces/dto/update-workspace-member-profile.dto';

export interface IWorkspaceService {
  create(
    userId: string,
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<Workspace>;
  findById(id: string): Promise<Workspace>;
  findBySlug(slug: string): Promise<Workspace>;
  findUserWorkspaces(userId: string): Promise<Workspace[]>;

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
}
