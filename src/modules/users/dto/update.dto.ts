import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create.dto';
import { IsDate, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { UserStatus } from 'src/core/enums';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsDate()
  @IsOptional()
  lastLoginAt?: Date;

  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
