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
import { IChannelService } from 'src/core/interfaces/services/channel.service.interface';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { WorkspaceRoleGuard } from 'src/modules/workspaces/guards/workspace-role.guard';
import { WorkspaceRoles } from 'src/common/decorators/workspace-roles.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { WorkspaceRole } from 'src/core/enums';

@Controller('workspaces/:workspaceId/channels')
@UseGuards(JwtAuthGuard)
export class ChannelController {
  constructor(
    @Inject('IChannelService')
    private readonly channelService: IChannelService,
  ) {}

  @Post()
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(
    WorkspaceRole.MEMBER,
    WorkspaceRole.ADMIN,
    WorkspaceRole.OWNER,
  )
  async create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() createChannelDto: CreateChannelDto,
  ) {
    return this.channelService.create(workspaceId, user.id, createChannelDto);
  }

  @Get()
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(
    WorkspaceRole.MEMBER,
    WorkspaceRole.ADMIN,
    WorkspaceRole.OWNER,
  )
  async findByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    return this.channelService.findUserChannels(workspaceId, user.id);
  }

  @Get(':channelId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(
    WorkspaceRole.MEMBER,
    WorkspaceRole.ADMIN,
    WorkspaceRole.OWNER,
  )
  async findById(@Param('channelId') channelId: string) {
    return this.channelService.findById(channelId);
  }

  @Post(':channelId/members')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  async addMember(
    @Param('channelId') channelId: string,
    @Body('userId') userId: string,
  ) {
    await this.channelService.addMember(channelId, userId);
    return { message: 'Member added successfully' };
  }

  @Delete(':channelId/members/:userId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  async removeMember(
    @Param('channelId') channelId: string,
    @Param('userId') userId: string,
  ) {
    await this.channelService.removeMember(channelId, userId);
    return { message: 'Member removed successfully' };
  }

  @Get(':channelId/members')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(
    WorkspaceRole.MEMBER,
    WorkspaceRole.ADMIN,
    WorkspaceRole.OWNER,
  )
  async getMembers(@Param('channelId') channelId: string) {
    return this.channelService.getMembers(channelId);
  }

  @Put(':channelId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  async update(
    @Param('channelId') channelId: string,
    @Body() updateChannelDto: Partial<CreateChannelDto>,
  ) {
    return this.channelService.update(channelId, updateChannelDto);
  }

  @Delete(':channelId')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  async delete(@Param('channelId') channelId: string) {
    await this.channelService.delete(channelId);
    return { message: 'Channel deleted successfully' };
  }
}
