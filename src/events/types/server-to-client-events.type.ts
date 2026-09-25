import { Message } from '../../messages/types/message.type.js';

export interface ServerToClientEvents {
  newMessage: (payload: Message) => void;
}
