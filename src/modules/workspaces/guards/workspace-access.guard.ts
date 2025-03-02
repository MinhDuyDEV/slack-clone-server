import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspacesService } from '../services/workspaces.service';

@Injectable()
export class WorkspaceAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private workspacesService: WorkspacesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get workspaceId from request body, params, or query
    let workspaceId = request.body?.workspaceId;

    if (!workspaceId) {
      workspaceId = request.params?.workspaceId;
    }

    if (!workspaceId) {
      workspaceId = request.query?.workspaceId;
    }

    // For section-specific operations, get the section first to find its workspaceId
    if (!workspaceId && request.params?.id) {
      const sectionId = request.params.id;
      try {
        // This assumes SectionsService is available through dependency injection
        // If not, you'll need to modify this approach
        const sectionsService = request.app.get('SectionsService');
        const section = await sectionsService.findOne(sectionId);
        workspaceId = section.workspaceId;
      } catch (error) {
        // If section not found or service not available, continue with validation
        // The request will likely fail later with a more specific error
      }
    }

    if (!workspaceId) {
      throw new ForbiddenException('Workspace ID not provided');
    }

    // Check if user is a member of the workspace
    const isMember = await this.workspacesService.isUserMemberOfWorkspace(
      workspaceId,
      user.id,
    );

    if (!isMember) {
      throw new ForbiddenException('User is not a member of this workspace');
    }

    return true;
  }
}
