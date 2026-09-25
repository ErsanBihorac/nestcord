import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    this.validateToken(client);

    return true;
  }

  validateToken(client: Socket) {
    const { authorization } = client.handshake.headers;
    if (typeof authorization !== 'string') {
      throw new UnauthorizedException('Missing authorization token');
    }

    const [bearer, token] = authorization.split(' ');
    if (!bearer || !token || bearer !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization headers');
    }
    const payload = jwt.verify(
      token,
      this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
    );

    client.data.userId = payload.sub; // set userId in the socket
    return payload;
  }
}
