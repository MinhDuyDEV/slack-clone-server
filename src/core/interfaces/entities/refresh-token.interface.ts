import { IBaseEntity } from './base.interface';

export interface IRefreshToken extends IBaseEntity {
  token: string;
  expiresAt: Date;
  isRevoked: boolean;

  userId: string;

  deviceInfo?: {
    userAgent?: string;
    ip?: string;
    device?: string;
    browser?: string;
    os?: string;
  };

  lastUsedAt?: Date;
  revokedAt?: Date;
  revokedByIp?: string;
  replacedByToken?: string;
}
