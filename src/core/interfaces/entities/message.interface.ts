import { IBaseEntity } from './base.interface';
import { IUser } from './user.interface';
import { IChannel } from './channel.interface';
import { MessageType } from 'src/core/enums';
import { IAttachment } from './attachment.interface';
import { IReaction } from './reaction.interface';

export interface IMessage extends IBaseEntity {
  content: string;
  type: MessageType;

  channelId: string;
  channel: IChannel;

  userId: string;
  user: IUser;

  parentId?: string;
  parent?: IMessage;
  replies?: IMessage[];

  attachments?: IAttachment[];
  reactions?: IReaction[];

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
