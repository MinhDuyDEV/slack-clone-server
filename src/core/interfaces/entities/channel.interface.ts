import { IBaseEntity } from './base.interface';
import { IMessage } from './message.interface';

export interface IChannel extends IBaseEntity {
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';

  workspaceId: string;
  createdBy: string;
  members?: IChannelMember[];
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
