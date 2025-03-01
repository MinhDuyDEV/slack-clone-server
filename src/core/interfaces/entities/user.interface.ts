import { RefreshToken } from 'src/modules/auth/entities/refresh-token.entity';
import { UserStatus } from '../../enums';
import { IBaseEntity } from './base.interface';
import { IChannel } from './channel.interface';
import { IDirectMessage } from './direct-message.interface';
import { IWorkspace } from './workspace.interface';

export interface IUser extends IBaseEntity {
  email: string;
  username: string;
  password?: string;
  refreshTokens: RefreshToken[];
  displayName?: string;

  avatar?: string;
  bio?: string;
  phoneNumber?: string;
  timezone?: string;

  status: UserStatus;
  isEmailVerified: boolean;
  isOnline: boolean;
  lastSeen?: Date;

  workspaces?: IWorkspace[];
  channels?: IChannel[];
  directMessages?: IDirectMessage[];

  notificationSettings?: {
    email: boolean;
    desktop: boolean;
    mobile: boolean;
    sound: boolean;
  };

  preferences?: {
    theme: 'light' | 'dark';
    language: string;
    sidebar: {
      collapsed: boolean;
      favorites: string[];
    };
    notifications: {
      muteFrom: string;
      muteTo: string;
      mutedWorkspaces: string[];
      mutedChannels: string[];
    };
  };

  lastLoginAt?: Date;
  lastPasswordChangeAt?: Date;

  hashPassword(): Promise<void>;
  comparePassword(password: string): Promise<boolean>;
}
