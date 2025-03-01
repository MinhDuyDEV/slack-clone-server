import { Exclude } from 'class-transformer';
import {
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BeforeInsert } from 'typeorm';
import { IUser } from 'src/core/interfaces/entities/user.interface';
import { Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserStatus } from 'src/core/enums';
import { RefreshToken } from 'src/modules/auth/entities/refresh-token.entity';
import { WorkspaceMember } from 'src/modules/workspaces/entities/workspace-member.entity';

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ unique: true })
  @Index()
  username: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password?: string;

  @Column({ nullable: true })
  provider?: 'local' | 'google' | 'facebook';

  @Column({ nullable: true })
  providerId?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  timezone?: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ nullable: true })
  lastSeen?: Date;

  @Column({ type: 'jsonb', nullable: true })
  notificationSettings?: {
    email: boolean;
    desktop: boolean;
    mobile: boolean;
    sound: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  preferences?: {
    theme: 'light' | 'dark';
    language: string;
    sidebar: {
      collapsed: boolean;
      favorites: string[];
    };
    notifications: {
      muteFrom: string;
      muteTo: string;
      mutedWorkspaces: string[];
      mutedChannels: string[];
    };
  };

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => WorkspaceMember, (member) => member.user)
  workspaces: WorkspaceMember[];

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  lastPasswordChangeAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
