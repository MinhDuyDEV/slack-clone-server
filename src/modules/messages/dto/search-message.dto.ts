import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchMessageDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsUUID()
  channelId?: string;

  @IsOptional()
  @IsUUID()
  workspaceId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasAttachments?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasReactions?: boolean;
}
