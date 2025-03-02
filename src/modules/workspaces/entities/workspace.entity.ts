import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IWorkspace } from 'src/core/interfaces/entities/workspace.interface';
import { User } from 'src/modules/users/entities/user.entity';
import { Channel } from 'src/modules/channels/entities/channel.entity';
import { WorkspaceMember } from './workspace-member.entity';
import { Section } from 'src/modules/sections/entities/section.entity';

@Entity('workspaces')
export class Workspace implements IWorkspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  logo?: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => WorkspaceMember, (member) => member.workspace)
  members: WorkspaceMember[];

  @OneToMany(() => Section, (section) => section.workspace)
  sections: Section[];

  @OneToMany(() => Channel, (channel) => channel.workspace)
  channels: Channel[];

  @Column({ type: 'jsonb', default: {} })
  settings: {
    allowInvites: boolean;
    allowPublicChannels: boolean;
    allowDirectMessages: boolean;
    defaultChannelId?: string;
    defaultSectionId?: string;
    directMessagesSectionId?: string;
    ownerDirectMessageSectionId?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
