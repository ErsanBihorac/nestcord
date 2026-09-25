import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { ConversationDto } from './dto/conversation.dto.js';
import { safeUserSelect } from '../user/types/safe-user.type.js';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto.js';

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

  async createGroupConversation(
    dto: CreateGroupConversationDto,
  ): Promise<ConversationDto> {
    const participantIds = [...new Set([dto.authorId, ...dto.participantId])];

    return await this.prismaService.conversation.create({
      data: {
        participants: {
          connect: participantIds.map((id) => ({ id })),
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
      Logger.log('Creating new direct conversation...', conversation.id);
    }

    return conversation;
  }

  async findOrCreateGroupConversation(
    dto: CreateGroupConversationDto,
  ): Promise<ConversationDto> {
    const participantIds = [...new Set([dto.authorId, ...dto.participantId])];

    let conversation = await this.prismaService.conversation.findFirst({
      where: {
        AND: [
          ...participantIds.map((id) => ({
            participants: {
              some: { id },
            },
          })),
          {
            participants: {
              every: {
                id: { in: participantIds },
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
      conversation = await this.createGroupConversation(dto);
      Logger.log('Creating new group conversation...', conversation.id);
    }

    return conversation;
  }
}
