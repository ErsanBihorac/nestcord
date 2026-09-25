import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { ConversationsService } from '../conversations/conversations.service.js';
import { Message } from './types/message.type.js';
import { CreateGroupMessageDto } from './dto/create-group-message.dto.js';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly conversationsService: ConversationsService,
  ) {}

  async createDirectMessage(dto: CreateMessageDto): Promise<Message> {
    const conversation =
      await this.conversationsService.findOrCreateConversation({
        authorId: dto.authorId,
        participantId: dto.participantId,
      });

    const createdMessage = await this.prismaService.message.create({
      data: {
        authorId: dto.authorId,
        message: dto.message,
        conversationId: conversation.id,
      },
    });

    return createdMessage;
  }

  async createGroupMessage(dto: CreateGroupMessageDto): Promise<Message> {
    const conversation =
      await this.conversationsService.findOrCreateGroupConversation({
        authorId: dto.authorId,
        participantId: dto.participantId,
      });

    const createdMessage = await this.prismaService.message.create({
      data: {
        authorId: dto.authorId,
        message: dto.message,
        conversationId: conversation.id,
      },
    });

    return createdMessage;
  }

  // async getAuthorMessageId(messageId: string): Promise<Message> {
  //   // 1. Socket connection => receive jwt of user (author)
  //   const authorId = '';

  //   const message = await this.prismaService.message.findUnique({
  //     where: {
  //       id: messageId,
  //       authorId: authorId,
  //     },
  //   });

  //   if (!message) {
  //     throw new Error(`Message with id ${messageId} was not found`);
  //   }

  //   return message;
  // }

  // async deleteAuthorMessageById(
  //   messageId: string,
  // ): Promise<{ success: boolean }> {
  //   // 1. Socket connection => receive jwt of user (author)
  //   const authorId = '';

  //   const deleted = await this.prismaService.message.delete({
  //     where: {
  //       id: messageId,
  //       authorId: authorId,
  //     },
  //   });

  //   if (!deleted) {
  //     throw new Error(`Deleting message with id ${messageId} failed`);
  //   }

  //   return {
  //     success: true,
  //   };
  // }
}
