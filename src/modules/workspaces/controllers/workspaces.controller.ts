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
}
