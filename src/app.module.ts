import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { EventsModule } from './events/events.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { ConversationsModule } from './conversations/conversations.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule,
    AuthModule,
    EventsModule,
    MessagesModule,
    ConversationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
