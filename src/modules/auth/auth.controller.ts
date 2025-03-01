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
import { UserRole } from 'src/core/enums';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RolesGuard } from './guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { IDeviceInfo } from 'src/core/interfaces/entities/device-info.interface';
import { IAuthService } from 'src/core/interfaces/services/auth.service.interface';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    @Inject('IAuthService') private readonly authService: IAuthService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request & { deviceInfo?: IDeviceInfo },
  ): Promise<IAuthResponse> {
    return this.authService.register(registerDto, req.deviceInfo);
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
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  verifyToken(@CurrentUser() user: User): { userId: string } {
    return { userId: user.id };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  adminRoute() {
    return 'This is an admin-only route';
  }
}
