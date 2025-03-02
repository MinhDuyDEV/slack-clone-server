import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SectionsService } from '../services/sections.service';
import { CreateSectionDto, UpdateSectionDto } from '../dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { WorkspaceAccessGuard } from 'src/modules/workspaces/guards/workspace-access.guard';
import { WorkspaceRoleGuard } from 'src/modules/workspaces/guards/workspace-role.guard';
import { WorkspaceRoles } from 'src/common/decorators/workspace-roles.decorator';
import { WorkspaceRole } from 'src/core/enums';

@Controller('workspaces/:workspaceId/sections')
@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() createSectionDto: CreateSectionDto,
    @Request() req,
  ) {
    // Đảm bảo workspaceId từ URL được sử dụng
    createSectionDto.workspaceId = workspaceId;
    return this.sectionsService.create(createSectionDto, req.user.id);
  }

  @Get()
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.sectionsService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Delete(':id')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }

  @Post('reorder')
  @UseGuards(WorkspaceRoleGuard)
  @WorkspaceRoles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
  reorder(
    @Param('workspaceId') workspaceId: string,
    @Body() body: { sectionIds: string[] },
  ) {
    return this.sectionsService.reorder(workspaceId, body.sectionIds);
  }

  @Get('default')
  getDefaultSection(@Param('workspaceId') workspaceId: string) {
    return this.sectionsService.getDefaultSection(workspaceId);
  }
}
