import { IsEmail, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(16)
  name!: string;

  @IsEmail()
  @IsString()
  @MaxLength(40)
  email!: string;
}
