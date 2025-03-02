import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('channel_members_roles')
export class ChannelMemberRole {
  @PrimaryColumn({ name: 'channel_id' })
  channelId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @Column()
  role: string;

  @Column({ name: 'joined_at' })
  joinedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
