import { Controller, Get, Put, Body, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IUserService } from '../../core/interfaces/services/user.service.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

  @Get('me')
  getCurrentUser(@CurrentUser() user: User) {
    return this.userService.findById(user.id);
  }

  @Put('me/profile')
  updateProfile(
    @CurrentUser() user: User,
    @Body() profileData: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.id, profileData);
  }

  @Put('me/password')
  updatePassword(
    @CurrentUser() user: User,
    @Body() passwordData: { currentPassword: string; newPassword: string },
  ) {
    return this.userService.updatePassword(
      user.id,
      passwordData.currentPassword,
      passwordData.newPassword,
    );
  }

  // Các endpoint khác liên quan đến quản lý thông tin cá nhân có thể được thêm vào đây
  // Ví dụ: cập nhật avatar, cài đặt thông báo, v.v.
}
