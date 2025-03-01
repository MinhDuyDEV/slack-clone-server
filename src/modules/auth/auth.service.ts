import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthService } from 'src/core/interfaces/services/auth.service.interface';
import { IUserService } from 'src/core/interfaces/services/user.service.interface';
import { IRefreshTokenRepository } from 'src/core/interfaces/repositories/refresh-token.repository.interface';
import {
  IAuthResponse,
  IRefreshTokenResponse,
  ITokens,
} from 'src/core/interfaces/entities/auth-response.interface';
import { User } from '../users/entities/user.entity';
import { IDeviceInfo } from 'src/core/interfaces/entities/device-info.interface';
import { RegisterDto } from './dto/register.dto';
import { UserStatus } from 'src/core/enums';
import { ITokenPayload } from 'src/core/interfaces/entities/token-payload.interface';
import { UserResponseDto } from '../users/dto/user-response.dto';
import {
  access_token_private_key,
  refresh_token_private_key,
  refresh_token_public_key,
} from 'src/common/utils/keys.util';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.userService.findByEmailWithPassword(email);
      if (!user) return null;

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) return null;

      return user;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      return null;
    }
  }

  async login(user: User, deviceInfo?: IDeviceInfo): Promise<IAuthResponse> {
    try {
      const tokens = await this.generateTokens(user);

      await this.refreshTokenRepository.create({
        userId: user.id,
        token: tokens.refreshToken,
        deviceInfo: {
          ip: deviceInfo?.ip,
          userAgent: deviceInfo?.userAgent,
        },
      });

      await this.userService.update(user.id, {
        lastLoginAt: new Date(),
        isOnline: true,
      });

      return {
        user: UserResponseDto.fromEntity(user),
        tokens,
      };
    } catch (error) {
      this.logger.error(`Error during login: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error during login');
    }
  }

  async register(
    registerDto: RegisterDto,
    deviceInfo?: IDeviceInfo,
  ): Promise<IAuthResponse> {
    try {
      const user = await this.userService.create({
        ...registerDto,
        status: UserStatus.PENDING,
      });

      const tokens = await this.generateTokens(user);

      await this.refreshTokenRepository.create({
        userId: user.id,
        token: tokens.refreshToken,
        deviceInfo: {
          ip: deviceInfo?.ip,
          userAgent: deviceInfo?.userAgent,
        },
      });

      await this.userService.update(user.id, {
        lastLoginAt: new Date(),
        isOnline: true,
      });

      return {
        user: UserResponseDto.fromEntity(user),
        tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) throw error;

      this.logger.error(
        `Error during registration: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error during registration');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    try {
      await this.refreshTokenRepository.revokeToken(refreshToken);
      await this.userService.updateLastSeen(userId);
    } catch (error) {
      this.logger.error(`Error during logout: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error during logout');
    }
  }

  async refreshToken(
    refreshToken: string,
    deviceInfo?: IDeviceInfo,
  ): Promise<IRefreshTokenResponse> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);

      const [user, token] = await Promise.all([
        this.userService.findById(payload.sub),
        this.refreshTokenRepository.findValidToken(payload.sub, refreshToken),
      ]);
      if (!user || !token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);

      await this.refreshTokenRepository.update(token.id, {
        token: tokens.refreshToken,
        deviceInfo: {
          ...token.deviceInfo,
          ip: deviceInfo?.ip,
          userAgent: deviceInfo?.userAgent,
        },
      });

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;

      this.logger.error(
        `Error refreshing token: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error refreshing token');
    }
  }

  private async generateTokens(user: User): Promise<ITokens> {
    const payload: Omit<ITokenPayload, 'type'> = {
      sub: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          algorithm: 'RS256',
          privateKey: access_token_private_key,
          expiresIn: this.configService.get<string>(
            'jwt.accessToken.expiresIn',
          ),
        },
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          algorithm: 'RS256',
          privateKey: refresh_token_private_key,
          expiresIn: this.configService.get<string>(
            'jwt.refreshToken.expiresIn',
          ),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpiresInSeconds(
        this.configService.get('jwt.accessToken.expiresIn'),
      ),
    };
  }

  private async verifyRefreshToken(token: string): Promise<ITokenPayload> {
    try {
      return await this.jwtService.verifyAsync<ITokenPayload>(token, {
        algorithms: ['RS256'],
        publicKey: refresh_token_public_key,
      });
    } catch (error) {
      this.logger.error(`Error verifying refresh token: ${error.message}`);

      // Check if token is expired
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private getExpiresInSeconds(expiresIn: string | number): number {
    if (typeof expiresIn === 'number') {
      return expiresIn;
    }

    const match = expiresIn.match(/(\d+)([smhd])/);
    if (!match) return 0;

    const [, value, unit] = match;
    const multiplier = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    }[unit];

    return parseInt(value) * multiplier;
  }
}
