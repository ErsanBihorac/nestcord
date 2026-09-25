import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { ConversationDto } from './dto/conversation.dto.js';
import { safeUserSelect } from '../user/types/safe-user.type.js';

@Injectable()
export class ConversationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createConversation(
    dto: CreateConversationDto,
  ): Promise<ConversationDto> {
    return await this.prismaService.conversation.create({
      data: {
        participants: {
          connect: [{ id: dto.authorId }, { id: dto.participantId }],
        },
      },
      include: {
        participants: {
          select: safeUserSelect,
        },
      },
    });
  }

  async findOrCreateConversation(
    dto: CreateConversationDto,
  ): Promise<ConversationDto> {
    let conversation = await this.prismaService.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: dto.authorId } } },
          { participants: { some: { id: dto.participantId } } },
          {
            participants: {
              every: {
                id: { in: [dto.authorId, dto.participantId] },
              },
            },
          },
        ],
      },
      include: {
        participants: {
          select: safeUserSelect,
        },
      },
    });

    if (!conversation) {
      conversation = await this.createConversation(dto);
    }

    return conversation;
  }
}
