import { CreateMessageDto } from 'src/modules/messages/dto/create-message.dto';
import { Message } from 'src/modules/messages/entities/message.entity';
import { UpdateMessageDto } from 'src/modules/messages/dto/update-message.dto';

export interface IMessageRepository {
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

  update(id: string, updateMessageDto: UpdateMessageDto): Promise<Message>;

  delete(id: string): Promise<void>;

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

  updateThreadInfo(threadParentId: string): Promise<void>;
}
