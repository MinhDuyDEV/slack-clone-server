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

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(
    @Inject('IWorkspaceService')
    private readonly workspaceService: IWorkspaceService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.create(user.id, createWorkspaceDto);
  }

  @Get('my')
  async getMyWorkspaces(@CurrentUser() user: User) {
    return this.workspaceService.findUserWorkspaces(user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.workspaceService.findById(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.workspaceService.findBySlug(slug);
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
