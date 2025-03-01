import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { UserRole, UserStatus } from 'src/core/enums';

export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Transform(({ value }) => value.toLowerCase())
  username: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  fullName: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/)
  password: string;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
