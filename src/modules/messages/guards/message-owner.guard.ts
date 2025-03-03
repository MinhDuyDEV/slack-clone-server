import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { IMessageService } from '../../../core/interfaces/services/message.service.interface';

@Injectable()
export class MessageOwnerGuard implements CanActivate {
  constructor(
    @Inject('IMessageService')
    private readonly messagesService: IMessageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const messageId = request.params.id;

    if (!messageId) {
      return true; // Không có messageId trong params, bỏ qua guard
    }

    try {
      const message = await this.messagesService.findById(messageId);

      // Kiểm tra xem user có phải là chủ sở hữu của message không
      if (message.userId !== userId) {
        throw new ForbiddenException(
          'You do not have permission to modify this message',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new NotFoundException('Message not found');
    }
  }
}
