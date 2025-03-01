import { IBaseRepository } from './base.repository.interface';
import { Workspace } from 'src/modules/workspaces/entities/workspace.entity';
import { IWorkspaceMember } from '../entities/workspace.interface';

export interface IWorkspaceRepository extends IBaseRepository<Workspace> {
  findBySlug(slug: string): Promise<Workspace | null>;
  findUserWorkspaces(userId: string): Promise<Workspace[]>;
  findMember(
    workspaceId: string,
    userId: string,
  ): Promise<IWorkspaceMember | null>;
  addMember(
    workspaceId: string,
    member: Partial<IWorkspaceMember>,
  ): Promise<IWorkspaceMember>;
  updateMember(
    workspaceId: string,
    userId: string,
    data: Partial<IWorkspaceMember>,
  ): Promise<IWorkspaceMember>;
  removeMember(workspaceId: string, userId: string): Promise<void>;
}
