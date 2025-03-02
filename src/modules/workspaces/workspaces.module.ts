import { Module } from '@nestjs/common';
import { Workspace } from './entities/workspace.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { WorkspacesRepository } from './repositories/workspace.repository';
import { WorkspaceRoleGuard } from './guards/workspace-role.guard';
import { WorkspacesService } from './services/workspaces.service';
import { WorkspacesController } from './controllers/workspaces.controller';
import { WorkspaceAccessGuard } from './guards/workspace-access.guard';
import { WorkspaceInvite } from './entities/workspace-invite.entity';
import { WorkspaceInviteRepository } from './repositories/workspace-invite.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, WorkspaceMember, WorkspaceInvite]),
  ],
  controllers: [WorkspacesController],
  providers: [
    WorkspacesService,
    WorkspacesRepository,
    WorkspaceInviteRepository,
    {
      provide: 'IWorkspaceRepository',
      useClass: WorkspacesRepository,
    },
    {
      provide: 'IWorkspaceService',
      useClass: WorkspacesService,
    },
    WorkspaceRoleGuard,
    WorkspaceAccessGuard,
  ],
  exports: [
    'IWorkspaceRepository',
    'IWorkspaceService',
    WorkspacesService,
    WorkspacesRepository,
    WorkspaceAccessGuard,
  ],
})
export class WorkspacesModule {}
