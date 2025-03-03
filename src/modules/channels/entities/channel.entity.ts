import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { IChannel } from 'src/core/interfaces/entities/channel.interface';
import { ChannelType } from 'src/core/enums';
import { User } from 'src/modules/users/entities/user.entity';
import { Workspace } from 'src/modules/workspaces/entities/workspace.entity';
import { Section } from 'src/modules/sections/entities/section.entity';
import { Message } from 'src/modules/messages/entities/message.entity';
import { IMessage } from 'src/core/interfaces/entities/message.interface';

@Entity('channels')
export class Channel implements IChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ChannelType,
    default: ChannelType.PUBLIC,
  })
  type: ChannelType;

  @Column()
  workspaceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.channels)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  sectionId: string;

  @ManyToOne(() => Section, (section) => section.channels)
  @JoinColumn({ name: 'sectionId' })
  section: Section;

  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  get isPrivate(): boolean {
    return this.type === ChannelType.PRIVATE;
  }

  @Column({ default: false })
  isDefault: boolean;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'channel_members',
    joinColumn: { name: 'channelId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  members: User[];

  @OneToMany(() => Message, (message) => message.channel)
  messages: IMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
