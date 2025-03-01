import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { WorkspaceController } from './controllers/workspace.controller';
import { WorkspaceService } from './services/workspace.service';
import { WorkspaceRepository } from './repositories/workspace.repository';
import { WorkspaceRoleGuard } from './guards/workspace-role.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, WorkspaceMember])],
  controllers: [WorkspaceController],
  providers: [
    {
      provide: 'IWorkspaceRepository',
      useClass: WorkspaceRepository,
    },
    {
      provide: 'IWorkspaceService',
      useClass: WorkspaceService,
    },
    WorkspaceRoleGuard,
  ],
  exports: ['IWorkspaceService', 'IWorkspaceRepository'],
})
export class WorkspaceModule {}
