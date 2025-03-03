import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IAttachment } from 'src/core/interfaces/entities/attachment.interface';
import { AttachmentType } from 'src/core/enums';
import { Message } from './message.entity';

@Entity('attachments')
export class Attachment implements IAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AttachmentType,
    default: AttachmentType.FILE,
  })
  type: AttachmentType;

  @Column()
  url: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  size?: number;

  @Column({ nullable: true })
  mimeType?: string;

  @Column()
  messageId: string;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
