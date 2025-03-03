import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { Reaction } from '../entities/reaction.entity';
import { IMessageRepository } from 'src/core/interfaces/repositories/message.repository.interface';

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Reaction)
    private reactionRepository: Repository<Reaction>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);
    return this.messageRepository.save(message);
  }

  async findById(id: string): Promise<Message> {
    return this.messageRepository.findOne({
      where: { id },
      relations: ['user', 'replies', 'reactions'],
    });
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
    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.user', 'user')
      .where('message.channelId = :channelId', { channelId });

    // Filter by parentId (null for main channel messages, specific ID for thread messages)
    if (options?.parentId === null) {
      query.andWhere('message.parentId IS NULL');
    } else if (options?.parentId) {
      query.andWhere('message.parentId = :parentId', {
        parentId: options.parentId,
      });
    }

    // Pagination using before/after timestamps
    if (options?.before) {
      query.andWhere('message.createdAt < :before', { before: options.before });
    }

    if (options?.after) {
      query.andWhere('message.createdAt > :after', { after: options.after });
    }

    // Order by creation date (newest last)
    query.orderBy('message.createdAt', 'ASC');

    // Limit results
    if (options?.limit) {
      query.take(options.limit);
    }

    return query.getMany();
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    await this.messageRepository.update(id, updateMessageDto);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.messageRepository.softDelete(id);
  }

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<Message> {
    const message = await this.findById(messageId);

    if (!message) {
      return null;
    }

    // Check if the reaction already exists
    const existingReaction = await this.reactionRepository.findOne({
      where: {
        messageId,
        userId,
        emoji,
      },
    });

    if (!existingReaction) {
      // Create new reaction
      const newReaction = this.reactionRepository.create({
        messageId,
        userId,
        emoji,
      });
      await this.reactionRepository.save(newReaction);
    }

    return this.findById(messageId);
  }

  async removeReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<Message> {
    // Find and delete the reaction
    await this.reactionRepository.delete({
      messageId,
      userId,
      emoji,
    });

    return this.findById(messageId);
  }

  async updateThreadInfo(threadParentId: string): Promise<void> {
    // Get the thread parent message
    const threadParent = await this.findById(threadParentId);

    if (!threadParent) {
      return;
    }

    // Count replies
    const replies = await this.messageRepository.count({
      where: { parentId: threadParentId },
    });

    // Get the latest reply timestamp
    const latestReply = await this.messageRepository.findOne({
      where: { parentId: threadParentId },
      order: { createdAt: 'DESC' },
    });

    // Update the thread parent
    await this.messageRepository.update(threadParentId, {
      isThreadParent: true,
      threadMessagesCount: replies,
      lastThreadMessageAt: latestReply?.createdAt,
    });
  }
}
