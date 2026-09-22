import {
  IsEmail,
  IsHash,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(16)
  name!: string;

  @IsEmail()
  @IsString()
  @MaxLength(40)
  email!: string;

  @IsHash('sha256')
  @IsString()
  passwordHash!: string;
}

export class CreateOAuthUserDto {
  @IsString()
  @MaxLength(16)
  name!: string;

  @IsEmail()
  @IsString()
  @MaxLength(40)
  email!: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  googleId?: string;

  @IsString()
  @IsOptional()
  githubId?: string;
}
