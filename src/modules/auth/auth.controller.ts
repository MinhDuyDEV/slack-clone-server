import {
  Get,
  Req,
  Res,
  Post,
  Body,
  Inject,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

import { IAuthResponse } from 'src/core/interfaces/entities/auth-response.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { IDeviceInfo } from 'src/core/interfaces/entities/device-info.interface';
import { IAuthService } from 'src/core/interfaces/services/auth.service.interface';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    @Inject('IAuthService') private readonly authService: IAuthService,
    private readonly configService: ConfigService,
  ) {}

  private setCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string; expiresIn: number },
  ) {
    // Set access token in HTTP-only cookie
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: tokens.expiresIn * 1000, // Convert seconds to milliseconds
      path: '/', // Available on all paths
    });

    // Set refresh token in HTTP-only cookie with longer expiration
    const refreshTokenExpiry =
      this.configService.get<number>('jwt.refreshToken.expiresIn') * 1000;
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenExpiry,
      path: '/', // Available on all paths
    });
  }

  private clearCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request & { deviceInfo?: IDeviceInfo },
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<IAuthResponse, 'tokens'>> {
    const deviceInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
    const authResponse = await this.authService.register(
      registerDto,
      deviceInfo,
    );

    // Set cookies with tokens
    this.setCookies(res, authResponse.tokens);

    // Return user data without tokens in the response body
    const { user } = authResponse;
    return { user };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() _loginDto: LoginDto,
    @CurrentUser() user: User,
    @Req() req: Request & { deviceInfo?: IDeviceInfo },
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<IAuthResponse, 'tokens'>> {
    const deviceInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
    const authResponse = await this.authService.login(user, deviceInfo);

    // Set cookies with tokens
    this.setCookies(res, authResponse.tokens);

    // Return user data without tokens in the response body
    return { user: authResponse.user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    // Get refresh token from cookie
    const refreshToken = req.cookies['refresh_token'];

    if (refreshToken) {
      await this.authService.logout(user.id, refreshToken);
    }

    // Clear cookies
    this.clearCookies(res);

    return { message: 'Logged out successfully' };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request & { deviceInfo?: IDeviceInfo },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    // Get refresh token from cookie
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const deviceInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    try {
      const newTokens = await this.authService.refreshToken(
        refreshToken,
        deviceInfo,
      );

      // Set new cookies
      this.setCookies(res, newTokens);

      return { message: 'Token refreshed successfully' };
    } catch (error) {
      // Clear cookies on error
      this.clearCookies(res);

      // If token is expired or invalid, return 410 Gone
      if (
        error instanceof UnauthorizedException &&
        (error.message.includes('expired') || error.message.includes('invalid'))
      ) {
        throw new HttpException('Refresh token expired', HttpStatus.GONE);
      }

      // Re-throw the original error for other cases
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: User): Promise<UserResponseDto> {
    return UserResponseDto.fromEntity(user);
  }
}
