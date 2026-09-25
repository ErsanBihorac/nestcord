import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway.js';
import { AuthModule } from '../auth/auth.module.js';
import { MessagesModule } from '../messages/messages.module.js';

@Module({
  imports: [AuthModule, MessagesModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
