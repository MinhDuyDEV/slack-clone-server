import { IBaseEntity } from './base.interface';
import { IChannel } from './channel.interface';

export interface IWorkspace extends IBaseEntity {
  name: string;
  slug: string;
  description?: string;
  logo?: string;

  ownerId: string;
  members?: IWorkspaceMember[];
  channels?: IChannel[];

  settings?: {
    allowInvites: boolean;
    allowPublicChannels: boolean;
    allowDirectMessages: boolean;
    defaultChannelId?: string;
  };
}

export interface IWorkspaceMember extends IBaseEntity {
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  status: 'active' | 'inactive' | 'invited';
  joinedAt: Date;
  invitedBy?: string;
}
