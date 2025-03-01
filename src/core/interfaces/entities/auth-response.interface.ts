import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';

export interface IAuthResponse {
  user: UserResponseDto;
  tokens: ITokens;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IRefreshTokenResponse extends ITokens {}
