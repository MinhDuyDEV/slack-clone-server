import { UserStatus } from 'src/core/enums';

export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    displayName?: string;
    avatar?: string;
    status: UserStatus;
    isEmailVerified: boolean;
    createdAt: Date;
  };
  tokens: ITokens;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IRefreshTokenResponse extends ITokens {}
