import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  authorId!: string;

  @IsUUID()
  participantId!: string;

  @IsString()
  @MaxLength(1028)
  @IsNotEmpty()
  @MinLength(1)
  message!: string;
}
