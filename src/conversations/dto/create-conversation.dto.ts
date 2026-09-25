import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  @IsNotEmpty()
  authorId!: string;

  @IsUUID()
  @IsNotEmpty()
  participantId!: string;
}
