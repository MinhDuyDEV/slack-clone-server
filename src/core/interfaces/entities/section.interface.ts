import { IBaseEntity } from './base.interface';
import { IChannel } from './channel.interface';
import { IWorkspace } from './workspace.interface';

export interface ISection extends IBaseEntity {
  name: string;
  description?: string;
  workspaceId: string;
  workspace: IWorkspace;
  channels?: IChannel[];
  order?: number;
  isDefault?: boolean;
  createdBy: string;
  settings?: {
    isCollapsed: boolean;
    isPrivate: boolean;
    allowedRoles?: string[];
  };
}
