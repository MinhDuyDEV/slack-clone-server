import { IsString, IsUUID } from 'class-validator';

export class AddReactionDto {
  @IsString()
  emoji: string;
}

export class RemoveReactionDto {
  @IsString()
  emoji: string;

  @IsUUID()
  messageId: string;
}
