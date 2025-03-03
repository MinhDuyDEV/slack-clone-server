import { IsOptional, IsDateString, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class MessagePaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsDateString()
  before?: string;

  @IsOptional()
  @IsDateString()
  after?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
