import { IUser } from '../entities/user.interface';

export interface IAuthPayload {
  sub: string; // user id
  email: string;
}

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService {
  validateUser(email: string, password: string): Promise<IUser | null>;
  login(user: IUser): Promise<ITokenResponse>;
  register(userData: Partial<IUser>): Promise<IUser>;
  refreshToken(token: string): Promise<ITokenResponse>;
  logout(userId: string): Promise<void>;
}
