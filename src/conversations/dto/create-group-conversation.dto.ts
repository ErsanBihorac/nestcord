import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateGroupConversationDto {
  @IsUUID()
  @IsNotEmpty()
  authorId!: string;

  @IsUUID(4, { each: true })
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsArray()
  @IsNotEmpty()
  participantId!: string[];
}
