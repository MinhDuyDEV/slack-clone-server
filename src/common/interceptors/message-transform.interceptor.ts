import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatMessageContent } from '../utils/message.utils';

@Injectable()
export class MessageTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Xử lý một mảng các message
        if (Array.isArray(data)) {
          return data.map((message) => this.transformMessage(message));
        }
        // Xử lý một message đơn lẻ
        else if (data && data.content) {
          return this.transformMessage(data);
        }
        // Trả về dữ liệu nguyên bản nếu không phải message
        return data;
      }),
    );
  }

  private transformMessage(message: any): any {
    if (!message) return message;

    // Tạo bản sao của message để tránh thay đổi dữ liệu gốc
    const transformedMessage = { ...message };

    // Định dạng nội dung tin nhắn
    if (transformedMessage.content) {
      transformedMessage.formattedContent = formatMessageContent(
        transformedMessage.content,
      );
    }

    // Thêm các thông tin bổ sung
    transformedMessage.isEdited = !!transformedMessage.edited;

    // Tính toán thời gian tương đối
    transformedMessage.relativeTime = this.getRelativeTime(
      new Date(transformedMessage.createdAt),
    );

    return transformedMessage;
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    // Định dạng ngày tháng cho các tin nhắn cũ hơn
    return date.toLocaleDateString();
  }
}
