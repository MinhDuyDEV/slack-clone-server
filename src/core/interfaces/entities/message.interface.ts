import { IBaseEntity } from './base.interface';

export interface IMessage extends IBaseEntity {
  content: string;
  type: 'text' | 'file' | 'system';

  channelId: string;
  userId: string;
  parentId?: string;

  attachments?: {
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
  }[];

  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];

  edited?: {
    at: Date;
    by: string;
  };

  isThreadParent?: boolean;
  threadMessagesCount?: number;
  lastThreadMessageAt?: Date;

  mentions?: {
    users: string[];
    channels: string[];
    everyone: boolean;
  };
}
