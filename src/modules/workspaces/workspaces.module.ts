import { Module } from '@nestjs/common';
import { Workspace } from './entities/workspace.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { WorkspacesRepository } from './repositories/workspace.repository';
import { WorkspaceRoleGuard } from './guards/workspace-role.guard';
import { WorkspacesService } from './services/workspaces.service';
import { WorkspacesController } from './controllers/workspaces.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, WorkspaceMember])],
  controllers: [WorkspacesController],
  providers: [
    {
      provide: 'IWorkspaceRepository',
      useClass: WorkspacesRepository,
    },
    {
      provide: 'IWorkspaceService',
      useClass: WorkspacesService,
    },
    WorkspaceRoleGuard,
  ],
  exports: ['IWorkspaceService', 'IWorkspaceRepository'],
})
export class WorkspacesModule {}
