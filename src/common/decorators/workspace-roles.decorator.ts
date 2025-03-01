import { SetMetadata } from '@nestjs/common';
import { WorkspaceRole } from 'src/core/enums';

export const WORKSPACE_ROLES_KEY = 'workspaceRoles';
export const WorkspaceRoles = (...roles: WorkspaceRole[]) =>
  SetMetadata(WORKSPACE_ROLES_KEY, roles);
