import { Socket } from 'socket.io';
import { WsJwtGuard } from '../guards/ws-jwt.guard.js';

export type SocketIOMiddleware = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (
  wsJwtGuard: WsJwtGuard,
): SocketIOMiddleware => {
  return (client, next) => {
    try {
      wsJwtGuard.validateToken(client);
      next();
    } catch (error) {
      next(new Error('Socket authentication failed:', { cause: error }));
    }
  };
};
