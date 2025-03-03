import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ChannelType } from 'src/core/enums';

export class CreateChannelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(ChannelType)
  @IsOptional()
  type?: ChannelType;

  @IsUUID()
  sectionId: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
