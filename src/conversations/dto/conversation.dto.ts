import { Message } from '../../messages/types/message.type.js';
import { SafeUser } from '../../user/types/safe-user.type.js';

export class ConversationDto {
  id!: string;
  messages?: Message[];
  participants!: SafeUser[];

  updatedAt!: Date;
  createdAt!: Date;
}
