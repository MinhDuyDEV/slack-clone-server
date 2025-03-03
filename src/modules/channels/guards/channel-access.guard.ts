import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ChannelsService } from '../services/channels.service';
import { ChannelType } from 'src/core/enums';

@Injectable()
export class ChannelAccessGuard implements CanActivate {
  constructor(private readonly channelsService: ChannelsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const channelId = request.params.channelId;

    if (!channelId) {
      return true; // Không có channelId trong params, bỏ qua guard
    }

    try {
      const channel = await this.channelsService.findById(channelId);

      // Nếu channel là PUBLIC, cho phép truy cập
      if (channel.type === ChannelType.PUBLIC) {
        return true;
      }

      // Nếu channel là PRIVATE hoặc DIRECT, kiểm tra xem user có phải là thành viên không
      const isMember = await this.channelsService.isMember(channelId, userId);

      if (!isMember) {
        throw new ForbiddenException(
          'You do not have permission to access this channel',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new NotFoundException('Channel not found');
    }
  }
}
