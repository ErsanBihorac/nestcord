import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents } from './types/server-to-client-events.type.js';
import { Message } from '../messages/types/message.type.js';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard.js';
import { SocketAuthMiddleware } from '../auth/middlewares/ws.middleware.js';
import { MessagesService } from '../messages/messages.service.js';

@WebSocketGateway({ namespace: 'events' })
export class EventsGateway {
  constructor(
    private readonly wsJwtGuard: WsJwtGuard,
    private readonly messagesService: MessagesService,
  ) {}
  @WebSocketServer()
  server!: Server<any, ServerToClientEvents>;

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware(this.wsJwtGuard) as any);
  }

  @SubscribeMessage('message')
  async handleMessage(client: any, payload: any): Promise<Message> {
    const message = await this.messagesService.createMessage({
      authorId: client.data.userId,
      participantId: payload.participantId,
      message: payload.message,
    }); // send message

    return message;
  }
}
