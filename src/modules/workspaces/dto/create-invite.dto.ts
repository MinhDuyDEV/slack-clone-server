import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkspaceRole } from 'src/core/enums';

export class CreateInviteDto {
  @IsEnum(WorkspaceRole)
  @IsOptional()
  role?: WorkspaceRole = WorkspaceRole.MEMBER;

  @IsBoolean()
  @IsOptional()
  multiUse?: boolean = false;

  @IsString()
  @IsOptional()
  expiresIn?: string = '7d'; // Default expiry: 7 days
}
