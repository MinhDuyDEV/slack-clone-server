import { WorkspaceRole } from 'src/core/enums';
import { IBaseEntity } from './base.interface';
import { IChannel } from './channel.interface';
import { ISection } from './section.interface';
import { IUser } from './user.interface';

export interface IWorkspace extends IBaseEntity {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;

  ownerId: string;
  members?: IWorkspaceMember[];
  sections?: ISection[];
  channels?: IChannel[];

  settings?: {
    allowInvites: boolean;
    allowPublicChannels: boolean;
    allowDirectMessages: boolean;
    defaultChannelId?: string;
    defaultSectionId?: string;
  };
}

export interface IWorkspaceMember extends IBaseEntity {
  workspaceId: string;
  userId: string;
  displayName?: string;
  title?: string;
  role: WorkspaceRole;
  isFavorite: boolean;
  notifications: boolean;
  status: 'active' | 'inactive' | 'invited';
  joinedAt: Date;
  invitedBy?: string;
  user?: IUser;
  workspace?: IWorkspace;
}
