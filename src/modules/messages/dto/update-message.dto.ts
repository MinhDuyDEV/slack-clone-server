import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';
import {
  IsObject,
  IsOptional,
  IsDate,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EditedInfoDto {
  @IsDate()
  @Type(() => Date)
  at: Date;

  @IsString()
  by: string;
}

export class UpdateMessageDto extends PartialType(
  OmitType(CreateMessageDto, ['channelId', 'userId'] as const),
) {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => EditedInfoDto)
  edited?: EditedInfoDto;
}
