import { IUser } from '../entities/user.interface';

export interface IAuthResponse {
  user: Omit<IUser, 'password'>;
  tokens: ITokens;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IRefreshTokenResponse extends ITokens {}
