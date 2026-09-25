import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  imports: [],
  providers: [ConversationsService, PrismaService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
