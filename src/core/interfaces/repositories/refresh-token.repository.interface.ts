import { IBaseRepository } from './base.repository.interface';
import { IRefreshToken } from '../entities/refresh-token.interface';

export interface IRefreshTokenRepository
  extends IBaseRepository<IRefreshToken> {
  findValidToken(userId: string, token: string): Promise<IRefreshToken | null>;
  revokeToken(token: string): Promise<void>;
  revokeAllUserTokens(userId: string): Promise<void>;
}
