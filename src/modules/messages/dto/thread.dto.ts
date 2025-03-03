import { IsOptional, IsUUID, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetThreadRepliesDto {
  @IsUUID()
  parentId: string;

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
}
