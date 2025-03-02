import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { IWorkspaceService } from 'src/core/interfaces/services/workspace.service.interface';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { WorkspaceRoleGuard } from '../guards/workspace-role.guard';
import { WorkspaceRoles } from 'src/common/decorators/workspace-roles.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { WorkspaceRole } from 'src/core/enums';
import { UpdateWorkspaceMemberProfileDto } from '../dto/update-workspace-member-profile.dto';
import { CreateInviteDto } from '../dto/create-invite.dto';
import { JoinWorkspaceDto } from '../dto/join-workspace.dto';
import { Workspace } from '../entities/workspace.entity';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(
    @Inject('IWorkspaceService')
    private readonly workspaceService: IWorkspaceService,
  ) {}

  private formatWorkspaceResponse(
    workspace: Workspace,
    currentUserId?: string,
  ) {
    const channelsBySection = new Map<string, any[]>();

    if (workspace.channels && workspace.channels.length > 0) {
      for (const channel of workspace.channels) {
        if (!channelsBySection.has(channel.sectionId)) {
          channelsBySection.set(channel.sectionId, []);
        }
        channelsBySection.get(channel.sectionId).push({
          id: channel.id,
          name: channel.name,
          description: channel.description,
          type: channel.type,
          isPrivate: channel.isPrivate,
          isDefault: channel.isDefault,
          sectionId: channel.sectionId,
        });
      }
    }

    const response = {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      logo: workspace.logo,
      ownerId: workspace.ownerId,
      settings: workspace.settings,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      sections: [],
    };

    if (workspace.sections && workspace.sections.length > 0) {
      const filteredSections = currentUserId
        ? workspace.sections.filter(
            (section) =>
              !section.isDirectMessages ||
              (section.isDirectMessages && section.userId === currentUserId),
          )
        : workspace.sections;

      response.sections = filteredSections.map((section) => ({
        id: section.id,
        name: section.name,
        isDefault: section.isDefault,
        isDirectMessages: section.isDirectMessages,
        order: section.order,
        userId: section.userId,
        channels: channelsBySection.get(section.id) || [],
      }));
    }

    return response;
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    const workspace = await this.workspaceService.create(
      user.id,
      createWorkspaceDto,
    );

    return this.formatWorkspaceResponse(workspace, user.id);
  }

  @Get('my')
  async getMyWorkspaces(@CurrentUser() user: User) {
    const workspaces = await this.workspaceService.findUserWorkspaces(user.id);
    return Promise.all(
      workspaces.map((workspace) =>
        this.formatWorkspaceResponse(workspace, user.id),
      ),
    );
  }

  @Get(':id')
  @UseGuards(WorkspaceRoleGuard)
  async findById(@Param('id') id: string, @CurrentUser() user: User) {
    const workspace = await this.workspaceService.findById(id, user.id);
    return this.formatWorkspaceResponse(workspace, user.id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string, @CurrentUser() user: User) {
    const workspace = await this.workspaceService.findBySlug(slug, user.id);
    return this.formatWorkspaceResponse(workspace, user.id);
  }

  @Post(':workspaceId/members')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  async addMember(
    @Param('workspaceId') workspaceId: string,
    @Body('userId') userId: string,
    @Body('role') role?: WorkspaceRole,
  ) {
    return this.workspaceService.addMember(workspaceId, userId, role);
  }

  @Put(':workspaceId/members/:userId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  async updateMember(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body('role') role: WorkspaceRole,
  ) {
    return this.workspaceService.updateMember(workspaceId, userId, role);
  }

  @Delete(':workspaceId/members/:userId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  async removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
  ) {
    await this.workspaceService.removeMember(workspaceId, userId);
    return { message: 'Member removed successfully' };
  }

  @Put(':workspaceId/settings')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.OWNER)
  async updateSettings(
    @Param('workspaceId') workspaceId: string,
    @Body()
    settings: {
      allowInvites?: boolean;
      allowPublicChannels?: boolean;
      allowDirectMessages?: boolean;
      defaultChannelId?: string;
    },
  ) {
    return this.workspaceService.updateSettings(workspaceId, settings);
  }

  @Put(':id/members/profile')
  async updateMemberProfile(
    @Param('id') workspaceId: string,
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateWorkspaceMemberProfileDto,
  ) {
    return this.workspaceService.updateMemberProfile(
      workspaceId,
      user.id,
      updateProfileDto,
    );
  }

  @Put(':id/members/:userId/profile')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  async updateOtherMemberProfile(
    @Param('id') workspaceId: string,
    @Param('userId') userId: string,
    @Body() updateProfileDto: UpdateWorkspaceMemberProfileDto,
  ) {
    return this.workspaceService.updateMemberProfile(
      workspaceId,
      userId,
      updateProfileDto,
    );
  }

  @Post(':workspaceId/invites')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  async createInvite(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() createInviteDto: CreateInviteDto,
  ) {
    return this.workspaceService.createInvite(
      workspaceId,
      user.id,
      createInviteDto,
    );
  }

  @Get(':workspaceId/invites')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  async getWorkspaceInvites(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.getWorkspaceInvites(workspaceId);
  }

  @Delete(':workspaceId/invites/:inviteId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  async deleteInvite(
    @Param('workspaceId') workspaceId: string,
    @Param('inviteId') inviteId: string,
  ) {
    await this.workspaceService.deleteInvite(workspaceId, inviteId);
    return { message: 'Invite deleted successfully' };
  }

  @Post('join')
  async joinWorkspace(
    @CurrentUser() user: User,
    @Body() joinWorkspaceDto: JoinWorkspaceDto,
  ) {
    return this.workspaceService.joinWorkspaceByCode(
      user.id,
      joinWorkspaceDto.inviteCode,
    );
  }
}
