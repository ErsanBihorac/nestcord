import { Message } from 'src/messages/types/message.type.js';
import { SafeUser } from 'src/user/types/safe-user.type.js';

export class ConversationDto {
  id!: string;
  messages?: Message[];
  participants!: SafeUser[];

  updatedAt!: Date;
  createdAt!: Date;
}
