import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Attachment } from './entities/attachment.entity';
import { Reaction } from './entities/reaction.entity';
import { MessageRepository } from './repositories/message.repository';
import { MessagesService } from './services/messages.service';
import { MessagesController } from './controllers/messages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Attachment, Reaction])],
  controllers: [MessagesController],
  providers: [
    {
      provide: 'IMessageRepository',
      useClass: MessageRepository,
    },
    {
      provide: 'IMessageService',
      useClass: MessagesService,
    },
  ],
  exports: ['IMessageService'],
})
export class MessagesModule {}
