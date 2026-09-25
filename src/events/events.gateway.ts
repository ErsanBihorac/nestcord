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
import { Logger } from '@nestjs/common';
import { CreateGroupMessageDto } from '../messages/dto/create-group-message.dto.js';
import { CreateMessageDto } from '../messages/dto/create-message.dto.js';

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

  @SubscribeMessage('message:direct')
  async handleDirectMessage(
    client: any,
    payload: CreateMessageDto,
  ): Promise<Message> {
    Logger.log('participants is a string');
    const message = await this.messagesService.createDirectMessage({
      authorId: client.data.userId,
      participantId: payload.participantId,
      message: payload.message,
    }); // send message

    return message;
  }

  @SubscribeMessage('message:group')
  async handleGroupMessage(
    client: any,
    payload: CreateGroupMessageDto,
  ): Promise<Message> {
    Logger.log('participants is an Array');
    const message = await this.messagesService.createGroupMessage({
      authorId: client.data.userId,
      participantId: payload.participantId,
      message: payload.message,
    });
    return message;
  }
}
