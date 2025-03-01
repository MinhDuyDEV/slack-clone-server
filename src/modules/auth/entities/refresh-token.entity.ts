import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { IRefreshToken } from 'src/core/interfaces/entities/refresh-token.interface';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken implements IRefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Exclude()
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('jsonb', { nullable: true })
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
    device?: string;
    browser?: string;
    os?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt?: Date;

  @Column({ nullable: true })
  revokedByIp?: string;

  @Column({ nullable: true })
  replacedByToken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  setExpiryDate() {
    if (!this.expiresAt) {
      this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }

  isActive(): boolean {
    return !this.isRevoked && !this.isExpired();
  }
}
