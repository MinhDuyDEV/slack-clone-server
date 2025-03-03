import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { Message } from '../entities/message.entity';
import { IMessageService } from '../../../core/interfaces/services/message.service.interface';
import { SearchMessageDto } from '../dto/search-message.dto';
import { IMessageRepository } from 'src/core/interfaces/repositories/message.repository.interface';

@Injectable()
export class MessagesService implements IMessageService {
  constructor(
    @Inject('IMessageRepository')
    private readonly messageRepository: IMessageRepository,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = await this.messageRepository.create(createMessageDto);

    // If this is a reply to a thread, update the thread parent info
    if (createMessageDto.parentId) {
      await this.messageRepository.updateThreadInfo(createMessageDto.parentId);
    }

    return message;
  }

  async findById(id: string): Promise<Message> {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async findByChannel(
    channelId: string,
    options?: {
      limit?: number;
      before?: Date;
      after?: Date;
      parentId?: string | null;
    },
  ): Promise<Message[]> {
    return this.messageRepository.findByChannel(channelId, options);
  }

  async update(
    id: string,
    userId: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    const message = await this.findById(id);

    // Check if the user is the author of the message
    if (message.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this message',
      );
    }

    // Add edited information
    updateMessageDto.edited = {
      at: new Date(),
      by: userId,
    };

    return this.messageRepository.update(id, updateMessageDto);
  }

  async delete(id: string, userId: string): Promise<void> {
    const message = await this.findById(id);

    // Check if the user is the author of the message
    if (message.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this message',
      );
    }

    await this.messageRepository.delete(id);

    // If this was a reply to a thread, update the thread parent info
    if (message.parentId) {
      await this.messageRepository.updateThreadInfo(message.parentId);
    }
  }

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<Message> {
    // Verify the message exists
    await this.findById(messageId);
    return this.messageRepository.addReaction(messageId, userId, emoji);
  }

  async removeReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<Message> {
    // Verify the message exists
    await this.findById(messageId);
    return this.messageRepository.removeReaction(messageId, userId, emoji);
  }

  async getThreadReplies(
    parentId: string,
    options?: {
      limit?: number;
      before?: Date;
      after?: Date;
    },
  ): Promise<Message[]> {
    // Verify the parent message exists
    await this.findById(parentId);

    // Get the channel ID from the parent message
    const parentMessage = await this.messageRepository.findById(parentId);

    return this.messageRepository.findByChannel(parentMessage.channelId, {
      ...options,
      parentId,
    });
  }

  async search(searchDto: SearchMessageDto): Promise<Message[]> {
    // Implement search functionality
    // This is a placeholder implementation
    // In a real application, you would use a more sophisticated search mechanism
    const { channelId, query } = searchDto;

    if (!channelId) {
      throw new NotFoundException('Channel ID is required for search');
    }

    const messages = await this.messageRepository.findByChannel(channelId);

    // Simple search by content
    return messages.filter((message) =>
      message.content.toLowerCase().includes(query.toLowerCase()),
    );
  }
}
