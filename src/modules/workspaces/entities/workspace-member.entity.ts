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
import { IWorkspaceMember } from 'src/core/interfaces/entities/workspace.interface';
import { WorkspaceRole } from 'src/core/enums';
import { User } from 'src/modules/users/entities/user.entity';
import { Workspace } from './workspace.entity';

@Entity('workspace_members')
export class WorkspaceMember implements IWorkspaceMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspaceId: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: WorkspaceRole,
    default: WorkspaceRole.MEMBER,
  })
  role: WorkspaceRole;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'invited'],
    default: 'invited',
  })
  status: 'active' | 'inactive' | 'invited';

  @Column()
  joinedAt: Date;

  @Column({ nullable: true })
  invitedBy?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.members)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
