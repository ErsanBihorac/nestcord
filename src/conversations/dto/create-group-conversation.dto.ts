import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateGroupConversationDto {
  @IsUUID()
  @IsNotEmpty()
  participantsIds!: string[];
}
