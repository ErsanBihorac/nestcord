import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOAuthUserDto, CreateUserDto } from './dto/create-user.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserDto } from './dto/user.dto.js';
import { Prisma, User } from '../generated/prisma/client.js';
import { SafeUser, safeUserSelect } from './types/safe-user.type.js';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {} //inject PrismaService

  async createWithPassword(data: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<SafeUser> {
    const user = await this.prismaService.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
      },
      select: safeUserSelect,
    });
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<SafeUser> {
    // füge User zur Prisma Datenbank hinzu und gebe das ergebnis zurück an den Controller
    const createdUser = await this.prismaService.user.create({
      data: createUserDto,
      select: safeUserSelect,
    });

    console.log('new user was created: ', createdUser);

    return createdUser;
  }

  async createOAuthUser(createUserDto: CreateOAuthUserDto): Promise<SafeUser> {
    const createdUser = await this.prismaService.user.create({
      data: createUserDto,
      select: safeUserSelect,
    });

    console.log('new user was created: ', createdUser);

    return createdUser;
  }

  async linkGoogleId(userId: string, googleId: string): Promise<void> {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        googleId,
        updatedAt: new Date(),
      },
      select: safeUserSelect,
    });
  }

  async linkGithubId(userId: string, githubId: string): Promise<void> {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        githubId,
        updatedAt: new Date(),
      },
      select: safeUserSelect,
    });
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string,
  ): Promise<void> {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash,
        updatedAt: new Date(),
      },
      select: safeUserSelect,
    });
  }

  async clearRefreshTokenHash(userId: string): Promise<void> {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash: null,
        updatedAt: new Date(),
      },
      select: safeUserSelect,
    });
  }

  async setResetPasswordToken(
    userId: string,
    passwordResetTokenHash: string,
    passwordResetTokenExpiresAt: Date,
  ): Promise<void> {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordResetTokenHash,
        passwordResetTokenExpiresAt,
        updatedAt: new Date(),
      },
      select: safeUserSelect,
    });
  }

  async resetPassword(userId: string, passwordHash: string): Promise<void> {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetTokenExpiresAt: null,
        refreshTokenHash: null,
        updatedAt: new Date(),
      },
      select: safeUserSelect,
    });
  }

  async getUsers(): Promise<SafeUser[]> {
    const users = await this.prismaService.user.findMany({
      select: safeUserSelect,
    });

    console.log(`${users.length} Users found`);

    return users;
  }

  async getUserById(id: string): Promise<UserDto> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      select: safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });

    return user;
  }

  toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      online: user.online,
      googleId: user.googleId,
      githubId: user.githubId,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findByGoogleId(googleId: string): Promise<SafeUser> {
    const user = await this.prismaService.user.findUnique({
      where: {
        googleId: googleId,
      },
      select: safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException(
        `User with google id ${googleId} was not found`,
      );
    }

    return user;
  }

  async findByGithubId(githubId: string): Promise<SafeUser> {
    const user = await this.prismaService.user.findUnique({
      where: {
        githubId: githubId,
      },
      select: safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException(
        `User with github id ${githubId} was not found`,
      );
    }

    return user;
  }

  async deleteUserById(id: string): Promise<SafeUser> {
    try {
      const deletedUser = await this.prismaService.user.delete({
        where: {
          id: id,
        },
        select: safeUserSelect,
      });

      return deletedUser;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with id ${id} does not exist`);
      }

      throw error;
    }
  }
}
