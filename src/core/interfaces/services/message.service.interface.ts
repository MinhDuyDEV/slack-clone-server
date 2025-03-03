import { Message } from '../../../modules/messages/entities/message.entity';
import { CreateMessageDto } from '../../../modules/messages/dto/create-message.dto';
import { UpdateMessageDto } from '../../../modules/messages/dto/update-message.dto';
import { SearchMessageDto } from '../../../modules/messages/dto/search-message.dto';

export interface IMessageService {
  create(createMessageDto: CreateMessageDto): Promise<Message>;

  findById(id: string): Promise<Message>;

  findByChannel(
    channelId: string,
    options?: {
      limit?: number;
      before?: Date;
      after?: Date;
      parentId?: string | null;
    },
  ): Promise<Message[]>;

  update(
    id: string,
    userId: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message>;

  delete(id: string, userId: string): Promise<void>;

  addReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<Message>;

  removeReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<Message>;

  getThreadReplies(
    parentId: string,
    options?: {
      limit?: number;
      before?: Date;
      after?: Date;
    },
  ): Promise<Message[]>;

  search(searchDto: SearchMessageDto): Promise<Message[]>;
}
