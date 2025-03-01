import {
  Get,
  Req,
  Post,
  Body,
  Inject,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Request } from 'express';

import {
  IAuthResponse,
  IRefreshTokenResponse,
} from 'src/core/interfaces/entities/auth-response.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { IDeviceInfo } from 'src/core/interfaces/entities/device-info.interface';
import { IAuthService } from 'src/core/interfaces/services/auth.service.interface';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    @Inject('IAuthService') private readonly authService: IAuthService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request & { deviceInfo?: IDeviceInfo },
  ): Promise<IAuthResponse> {
    const deviceInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
    return this.authService.register(registerDto, deviceInfo);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() _loginDto: LoginDto,
    @CurrentUser() user: User,
    @Req() req: Request & { deviceInfo?: IDeviceInfo },
  ): Promise<IAuthResponse> {
    const deviceInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
    return this.authService.login(user, deviceInfo);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: User,
    @Body('refreshToken') refreshToken: string,
  ): Promise<void> {
    return this.authService.logout(user.id, refreshToken);
  }

  @Public()
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
    @Req() req: Request & { deviceInfo?: IDeviceInfo },
  ): Promise<IRefreshTokenResponse> {
    return this.authService.refreshToken(refreshToken, req.deviceInfo);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: User): Promise<UserResponseDto> {
    return UserResponseDto.fromEntity(user);
  }
}
