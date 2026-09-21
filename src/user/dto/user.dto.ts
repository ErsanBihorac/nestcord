import {
  IsBoolean,
  IsEmail,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UserDto {
  @IsUUID()
  id!: string;

  @IsString()
  @MaxLength(16)
  name!: string;

  @IsEmail()
  @IsString()
  @MaxLength(40)
  email!: string;

  @IsBoolean()
  online!: boolean;
}
