import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  workspaceId: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isDirectMessages?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsOptional()
  settings?: {
    isCollapsed?: boolean;
    isPrivate?: boolean;
    allowedRoles?: string[];
  };
}
