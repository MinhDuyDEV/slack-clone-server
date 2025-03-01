import { IBaseEntity } from './base.interface';
import { IMessage } from './message.interface';
import { ChannelType } from 'src/core/enums';
import { IUser } from './user.interface';
import { IWorkspace } from './workspace.interface';

export interface IChannel {
  id: string;
  name: string;
  description?: string;
  type: ChannelType;
  workspaceId: string;
  workspace: IWorkspace;
  createdBy: string;
  creator: IUser;
  isPrivate: boolean;
  members?: IUser[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  messages?: IMessage[];

  settings?: {
    isArchived: boolean;
    isMuted: boolean;
    retentionDays?: number;
    allowThreads: boolean;
    allowReactions: boolean;
  };
}

export interface IChannelMember extends IBaseEntity {
  channelId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  lastReadMessageId?: string;
  notifications: {
    muted: boolean;
    keywords: string[];
  };
}
