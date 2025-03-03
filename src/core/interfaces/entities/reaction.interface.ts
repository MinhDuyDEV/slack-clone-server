import { IBaseEntity } from './base.interface';
import { IUser } from './user.interface';

export interface IReaction extends IBaseEntity {
  emoji: string;
  messageId: string;
  userId: string;
  user: IUser;
}
