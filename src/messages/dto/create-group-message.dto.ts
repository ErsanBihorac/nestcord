import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGroupMessageDto {
  @IsUUID()
  authorId!: string;

  @IsUUID()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID(4, { each: true })
  participantId!: string[];

  @IsString()
  @MaxLength(1028)
  @IsNotEmpty()
  @MinLength(1)
  message!: string;
}
