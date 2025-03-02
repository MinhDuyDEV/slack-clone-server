import { IBaseRepository } from './base.repository.interface';
import { Workspace } from 'src/modules/workspaces/entities/workspace.entity';
import { WorkspaceMember } from 'src/modules/workspaces/entities/workspace-member.entity';
import { WorkspaceRole } from 'src/core/enums';
import { IWorkspaceMember } from '../entities/workspace.interface';

export interface IWorkspaceRepository extends IBaseRepository<Workspace> {
  findBySlug(slug: string): Promise<Workspace | null>;
  findUserWorkspaces(
    userId: string,
    includeDetails?: boolean,
  ): Promise<Workspace[]>;
  addMember(
    workspaceId: string,
    member: Partial<IWorkspaceMember>,
  ): Promise<WorkspaceMember>;
  findMember(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null>;
  updateMember(
    workspaceId: string,
    userId: string,
    data: Partial<IWorkspaceMember>,
  ): Promise<WorkspaceMember>;
  removeMember(workspaceId: string, userId: string): Promise<void>;
  getMembers(workspaceId: string): Promise<WorkspaceMember[]>;
}
