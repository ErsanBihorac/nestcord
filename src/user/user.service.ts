import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserDto } from './dto/user.dto.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {} //inject PrismaService

  async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
    // füge User zur Prisma Datenbank hinzu und gebe das ergebnis zurück an den Controller
    const createdUser = await this.prismaService.user.create({
      data: createUserDto,
    });

    console.log('new user was created: ', createdUser);

    return createdUser;
  }

  async getUsers(): Promise<UserDto[]> {
    const users = await this.prismaService.user.findMany();

    console.log(`${users.length} Users found`);

    return users;
  }

  async getUserById(id: string): Promise<UserDto> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    return user;
  }

  async deleteUserById(id: string): Promise<UserDto> {
    try {
      const deletedUser = await this.prismaService.user.delete({
        where: {
          id: id,
        },
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
