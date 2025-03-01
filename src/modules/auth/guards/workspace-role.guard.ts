import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspaceRole } from 'src/core/enums';
import { WORKSPACE_ROLES_KEY } from 'src/common/decorators/workspace-roles.decorator';
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

    const member = await this.workspaceService.getMember(workspaceId, user.id);

    return member && requiredRoles.includes(member.role);
  }
}
