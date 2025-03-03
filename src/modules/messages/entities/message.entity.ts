import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { IMessage } from 'src/core/interfaces/entities/message.interface';
import { User } from 'src/modules/users/entities/user.entity';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { MessageType } from 'src/core/enums';
import { Attachment } from './attachment.entity';
import { Reaction } from './reaction.entity';

@Entity('messages')
export class Message implements IMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column()
  channelId: string;

  @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  parentId?: string;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: Message;

  @OneToMany(() => Message, (message) => message.parent)
  replies?: Message[];

  @OneToMany(() => Attachment, (attachment) => attachment.message)
  attachments?: Attachment[];

  @OneToMany(() => Reaction, (reaction) => reaction.message)
  reactions?: Reaction[];

  @Column('json', { nullable: true })
  edited?: {
    at: Date;
    by: string;
  };

  @Column({ default: false })
  isThreadParent?: boolean;

  @Column({ default: 0 })
  threadMessagesCount?: number;

  @Column({ nullable: true })
  lastThreadMessageAt?: Date;

  @Column('json', { nullable: true })
  mentions?: {
    users: string[];
    channels: string[];
    everyone: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
