import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { MessagesController } from './messages.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConversationsModule } from '../conversations/conversations.module.js';

@Module({
  imports: [ConversationsModule],
  providers: [MessagesService, PrismaService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
