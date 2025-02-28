import { IBaseEntity } from './base.interface';
import { IMessage } from './message.interface';

export interface IDirectMessage extends IBaseEntity {
  participants: string[]; // userIds
  workspaceId: string;
  lastMessageAt?: Date;
  messages?: IMessage[];

  settings?: {
    muted: boolean;
    archived: boolean;
    pinned: boolean;
  };
}
