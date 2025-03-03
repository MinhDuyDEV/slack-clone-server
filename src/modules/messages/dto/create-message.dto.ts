import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType, AttachmentType } from 'src/core/enums';

class AttachmentDto {
  @IsEnum(AttachmentType)
  type: AttachmentType;

  @IsString()
  url: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  size?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

class MentionsDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  users?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  channels?: string[];

  @IsBoolean()
  @IsOptional()
  everyone?: boolean;
}

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsUUID()
  channelId: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MentionsDto)
  mentions?: MentionsDto;
}
