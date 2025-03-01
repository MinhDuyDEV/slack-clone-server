import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WORKSPACE_ROLES_KEY } from 'src/common/decorators/workspace-roles.decorator';
import { WorkspaceRole } from 'src/core/enums';
import { IWorkspaceService } from 'src/core/interfaces/services/workspace.service.interface';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('IWorkspaceService')
    private workspaceService: IWorkspaceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId;

    if (!workspaceId || !user) {
      return false;
    }

    const member = await this.workspaceService.getMember(workspaceId, user.id);
    if (!member) {
      return false;
    }

    return requiredRoles.includes(member.role);
  }
}
