import { IBaseEntity } from './base.interface';
import { IChannel } from './channel.interface';
import { IWorkspace } from './workspace.interface';
import { IUser } from './user.interface';

export interface ISection extends IBaseEntity {
  name: string;
  description?: string;
  workspaceId: string;
  workspace: IWorkspace;
  channels?: IChannel[];
  order?: number;
  isDefault?: boolean;
  isDirectMessages?: boolean;
  createdBy: string;
  creator?: IUser;
  userId?: string;
  user?: IUser;
  settings?: {
    isCollapsed?: boolean;
    isPrivate?: boolean;
    allowedRoles?: string[];
  };
}
