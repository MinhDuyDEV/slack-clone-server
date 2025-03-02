import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSectionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsOptional()
  order?: number;

  @IsOptional()
  settings?: {
    isCollapsed?: boolean;
    isPrivate?: boolean;
    allowedRoles?: string[];
  };
}
