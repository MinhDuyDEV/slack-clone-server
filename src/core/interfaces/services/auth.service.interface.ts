import { User } from 'src/modules/users/entities/user.entity';
import { IDeviceInfo } from '../entities/device-info.interface';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { IAuthResponse } from '../entities/auth-response.interface';
import { IRefreshTokenResponse } from '../entities/auth-response.interface';
import { ITokenPayload } from '../entities/token-payload.interface';

export interface IAuthService {
  register(
    registerDto: RegisterDto,
    deviceInfo?: IDeviceInfo,
  ): Promise<IAuthResponse>;
  login(user: User, deviceInfo?: IDeviceInfo): Promise<IAuthResponse>;
  logout(userId: string, refreshToken: string): Promise<void>;
  refreshToken(
    refreshToken: string,
    deviceInfo?: IDeviceInfo,
  ): Promise<IRefreshTokenResponse>;
  validateUser(email: string, password: string): Promise<User | null>;
  verifyAccessToken(token: string): Promise<ITokenPayload>;
  findUser(id: any): Promise<User>;
}
